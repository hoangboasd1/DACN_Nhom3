using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Models;
using EcommerceBackend.Services;

[Route("api/[controller]")]
[ApiController]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrderController(AppDbContext context)
    {
        _context = context;
    }

    // Admin: Xem tất cả đơn hàng
    [HttpGet("getAll")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                    .ThenInclude(pv => pv.Color)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                    .ThenInclude(pv => pv.Size)
            .Include(o => o.Payments)
            .ToListAsync();
        return Ok(orders);
    }

    // User: Xem đơn hàng của chính mình
    [HttpGet("user")]
    [Authorize]
    public async Task<IActionResult> GetUserOrders()
    {
        var userId = GetUserIdFromClaims();
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                    .ThenInclude(pv => pv.Color)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                    .ThenInclude(pv => pv.Size)
            .Include(o => o.Payments)
            .ToListAsync();
        return Ok(orders);
    }

    // Lấy đơn hàng theo ID
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                    .ThenInclude(pv => pv.Color)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                    .ThenInclude(pv => pv.Size)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null) return NotFound();

        var userId = GetUserIdFromClaims();
        if (order.UserId != userId)
            return Forbid();

        return Ok(order);
    }

    // Tạo đơn hàng từ giỏ hàng
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var userId = GetUserIdFromClaims();

            var cartItems = await _context.Carts
                .Include(c => c.Product)
                .Include(c => c.ProductVariant)
                    .ThenInclude(pv => pv.Color)
                .Include(c => c.ProductVariant)
                    .ThenInclude(pv => pv.Size)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return BadRequest("Giỏ hàng trống.");

            if (cartItems.Any(item => item.Product == null))
                return BadRequest("Một số sản phẩm không còn tồn tại.");

            var total = cartItems.Sum(item => item.Product.Price * item.Quantity);
            
            // Tính phí ship dựa trên địa chỉ giao hàng
            var shippingFee = await ShippingService.CalculateShippingFee(request.DeliveryAddress);
            var grandTotal = total + shippingFee;

            var newOrder = new Order
            {
                UserId = userId,
                TotalAmount = grandTotal, // Tổng tiền bao gồm cả phí ship
                ShippingFee = shippingFee, // Phí ship được tính dựa trên địa chỉ
                OrderDate = DateTime.Now
            };

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync();

            // Tính phí ship chia đều cho từng sản phẩm
            var totalItems = cartItems.Sum(item => item.Quantity);
            var shippingFeePerItem = totalItems > 0 ? shippingFee / totalItems : 0;

            foreach (var item in cartItems)
            {
                // Kiểm tra tồn kho trước khi tạo đơn hàng
                int availableStock = item.ProductVariant?.StockQuantity ?? item.Product.Instock;
                if (availableStock < item.Quantity)
                {
                    var productName = item.Product.Name;
                    var variantInfo = item.ProductVariant != null 
                        ? $" ({item.ProductVariant.Color?.Name} - {item.ProductVariant.Size?.Name})" 
                        : "";
                    return BadRequest($"Sản phẩm '{productName}{variantInfo}' không đủ hàng. Chỉ còn {availableStock} sản phẩm.");
                }

                // Tính giá sản phẩm (có thể có điều chỉnh từ biến thể)
                decimal basePrice = item.Product.Price;
                if (item.ProductVariant?.PriceAdjustment.HasValue == true)
                {
                    basePrice += item.ProductVariant.PriceAdjustment.Value;
                }

                var detail = new OrderDetail
                {
                    OrderId = newOrder.OrderId,
                    ProductId = item.ProductId,
                    ProductVariantId = item.ProductVariantId, // Lưu ProductVariantId
                    Quantity = item.Quantity,
                    UnitPrice = basePrice + shippingFeePerItem // Giá sản phẩm + điều chỉnh biến thể + phí ship chia đều
                };
                _context.OrderDetails.Add(detail);

                // Trừ số lượng tồn kho NGAY KHI ĐẶT HÀNG để tránh overselling
                if (item.ProductVariant != null)
                {
                    // Trừ tồn kho biến thể
                    item.ProductVariant.StockQuantity -= item.Quantity;
                    _context.ProductVariants.Update(item.ProductVariant);
                    
                    // Trừ tồn kho sản phẩm cha chung
                    item.Product.Instock -= item.Quantity;
                    _context.Products.Update(item.Product);
                }
                else
                {
                    // Trừ tồn kho sản phẩm cơ bản
                    item.Product.Instock -= item.Quantity;
                    _context.Products.Update(item.Product);
                }
            }

            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(newOrder);
        }
        catch (Exception ex)
        {
            Console.WriteLine("🔥 LỖI TẠI CREATE ORDER:");
            Console.WriteLine(ex.Message);
            Console.WriteLine(ex.StackTrace);

            return StatusCode(500, "Lỗi server nội bộ: " + ex.Message);
        }
    }


    // User: Hủy đơn hàng của chính mình
    [HttpPut("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelOrder(int id)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(pv => pv.Color)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(pv => pv.Size)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound("Không tìm thấy đơn hàng.");

            // Kiểm tra quyền sở hữu đơn hàng
            if (order.UserId != userId)
                return Forbid("Bạn không có quyền hủy đơn hàng này.");

            // Kiểm tra trạng thái có thể hủy
            if (order.Status == "Completed")
                return BadRequest("Không thể hủy đơn hàng đã hoàn thành.");
            
            if (order.Status == "Cancelled")
                return BadRequest("Đơn hàng đã được hủy trước đó.");

            // Hoàn lại số lượng tồn kho khi hủy đơn hàng
            foreach (var detail in order.OrderDetails)
            {
                if (detail.ProductVariant != null)
                {
                    // Hoàn trả tồn kho cho biến thể sản phẩm
                    Console.WriteLine($"🔄 Hoàn kho biến thể: {detail.Product.Name} ({detail.ProductVariant.Color?.Name} - {detail.ProductVariant.Size?.Name}) - Thêm {detail.Quantity} vào tồn kho biến thể (từ {detail.ProductVariant.StockQuantity})");
                    detail.ProductVariant.StockQuantity += detail.Quantity;
                    Console.WriteLine($"✅ Hoàn kho biến thể thành công: Tồn kho mới = {detail.ProductVariant.StockQuantity}");
                    _context.ProductVariants.Update(detail.ProductVariant);
                    
                    // Hoàn trả tồn kho cho sản phẩm cha chung
                    Console.WriteLine($"🔄 Hoàn kho sản phẩm cha: {detail.Product.Name} - Thêm {detail.Quantity} vào tồn kho sản phẩm cha (từ {detail.Product.Instock})");
                    detail.Product.Instock += detail.Quantity;
                    Console.WriteLine($"✅ Hoàn kho sản phẩm cha thành công: Tồn kho mới = {detail.Product.Instock}");
                    _context.Products.Update(detail.Product);
                }
                else
                {
                    // Hoàn trả tồn kho cho sản phẩm cơ bản
                    Console.WriteLine($"🔄 Hoàn kho sản phẩm: {detail.Product.Name} - Thêm {detail.Quantity} vào tồn kho (từ {detail.Product.Instock})");
                    detail.Product.Instock += detail.Quantity;
                    Console.WriteLine($"✅ Hoàn kho sản phẩm thành công: Tồn kho mới = {detail.Product.Instock}");
                    _context.Products.Update(detail.Product);
                }
            }

            // Cập nhật trạng thái thanh toán thành Failed khi hủy đơn hàng
            var payments = await _context.Payments.Where(p => p.OrderId == id).ToListAsync();
            foreach (var payment in payments)
            {
                if (payment.Status != Models.PaymentStatus.Paid) // Chỉ cập nhật nếu chưa thanh toán
                {
                    payment.Status = Models.PaymentStatus.Failed; // Failed = 2
                    _context.Payments.Update(payment);
                    Console.WriteLine($"💳 Cập nhật trạng thái thanh toán thành Failed ({(int)Models.PaymentStatus.Failed}) cho Payment ID: {payment.PaymentId}");
                }
            }

            // Cập nhật trạng thái thành Cancelled
            order.Status = "Cancelled";
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = $"Đã hủy đơn hàng thành công. Đã hoàn lại tồn kho cho {order.OrderDetails.Count} sản phẩm.",
                status = "Cancelled"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error cancelling order: {ex.Message}");
            return StatusCode(500, "Lỗi khi hủy đơn hàng.");
        }
    }

    // Admin: Cập nhật trạng thái đơn hàng
    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(pv => pv.Color)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(pv => pv.Size)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound("Không tìm thấy đơn hàng.");

            // Kiểm tra trạng thái hợp lệ
            var validStatuses = new[] { "Pending", "Processing", "Completed", "Cancelled" };
            if (!validStatuses.Contains(request.Status))
                return BadRequest("Trạng thái không hợp lệ.");

            // Ngăn chặn chỉnh sửa trạng thái từ Completed hoặc Cancelled
            if (order.Status == "Completed" || order.Status == "Cancelled")
            {
                return BadRequest($"Không thể chỉnh sửa trạng thái đơn hàng đã '{order.Status}'. Đơn hàng đã được hoàn tất hoặc hủy bỏ.");
            }

            // Nếu chuyển sang Cancelled và trước đó chưa Cancelled
            if (request.Status == "Cancelled" && order.Status != "Cancelled")
            {
                // Hoàn lại số lượng tồn kho khi hủy đơn hàng
                foreach (var detail in order.OrderDetails)
                {
                    if (detail.ProductVariant != null)
                    {
                        // Hoàn trả tồn kho cho biến thể sản phẩm
                        Console.WriteLine($"🔄 Admin hoàn kho biến thể: {detail.Product.Name} ({detail.ProductVariant.Color?.Name} - {detail.ProductVariant.Size?.Name}) - Thêm {detail.Quantity} vào tồn kho biến thể (từ {detail.ProductVariant.StockQuantity})");
                        detail.ProductVariant.StockQuantity += detail.Quantity;
                        Console.WriteLine($"✅ Admin hoàn kho biến thể thành công: Tồn kho mới = {detail.ProductVariant.StockQuantity}");
                        _context.ProductVariants.Update(detail.ProductVariant);
                        
                        // Hoàn trả tồn kho cho sản phẩm cha chung
                        Console.WriteLine($"🔄 Admin hoàn kho sản phẩm cha: {detail.Product.Name} - Thêm {detail.Quantity} vào tồn kho sản phẩm cha (từ {detail.Product.Instock})");
                        detail.Product.Instock += detail.Quantity;
                        Console.WriteLine($"✅ Admin hoàn kho sản phẩm cha thành công: Tồn kho mới = {detail.Product.Instock}");
                        _context.Products.Update(detail.Product);
                    }
                    else
                    {
                        // Hoàn trả tồn kho cho sản phẩm cơ bản
                        Console.WriteLine($"🔄 Admin hoàn kho sản phẩm: {detail.Product.Name} - Thêm {detail.Quantity} vào tồn kho (từ {detail.Product.Instock})");
                        detail.Product.Instock += detail.Quantity;
                        Console.WriteLine($"✅ Admin hoàn kho sản phẩm thành công: Tồn kho mới = {detail.Product.Instock}");
                        _context.Products.Update(detail.Product);
                    }
                }

                // Cập nhật trạng thái thanh toán thành Failed khi hủy đơn hàng
                var payments = await _context.Payments.Where(p => p.OrderId == id).ToListAsync();
                foreach (var payment in payments)
                {
                    if (payment.Status != Models.PaymentStatus.Paid) // Chỉ cập nhật nếu chưa thanh toán
                    {
                        payment.Status = Models.PaymentStatus.Failed; // Failed = 2
                        _context.Payments.Update(payment);
                        Console.WriteLine($"💳 Admin hủy đơn hàng - Cập nhật trạng thái thanh toán thành Failed ({(int)Models.PaymentStatus.Failed}) cho Payment ID: {payment.PaymentId}");
                    }
                }
            }
            
            // Nếu từ Cancelled chuyển sang trạng thái khác (không phải Cancelled)
            if (order.Status == "Cancelled" && request.Status != "Cancelled")
            {
                // Trừ lại kho khi khôi phục đơn hàng từ trạng thái hủy
                foreach (var detail in order.OrderDetails)
                {
                    if (detail.ProductVariant != null)
                    {
                        // Kiểm tra và trừ tồn kho biến thể
                        Console.WriteLine($"🔄 Khôi phục đơn hàng biến thể: Kiểm tra tồn kho {detail.Product.Name} ({detail.ProductVariant.Color?.Name} - {detail.ProductVariant.Size?.Name}) - Cần {detail.Quantity}, có {detail.ProductVariant.StockQuantity}");
                        if (detail.ProductVariant.StockQuantity < detail.Quantity)
                        {
                            Console.WriteLine($"❌ Không đủ hàng biến thể để khôi phục: {detail.Product.Name} ({detail.ProductVariant.Color?.Name} - {detail.ProductVariant.Size?.Name})");
                            return BadRequest($"Biến thể sản phẩm '{detail.Product.Name} ({detail.ProductVariant.Color?.Name} - {detail.ProductVariant.Size?.Name})' không đủ hàng để khôi phục đơn hàng. Chỉ còn {detail.ProductVariant.StockQuantity} sản phẩm.");
                        }
                        detail.ProductVariant.StockQuantity -= detail.Quantity;
                        Console.WriteLine($"✅ Khôi phục biến thể thành công: Tồn kho mới = {detail.ProductVariant.StockQuantity}");
                        _context.ProductVariants.Update(detail.ProductVariant);
                        
                        // Kiểm tra và trừ tồn kho sản phẩm cha chung
                        Console.WriteLine($"🔄 Khôi phục đơn hàng sản phẩm cha: Kiểm tra tồn kho {detail.Product.Name} - Cần {detail.Quantity}, có {detail.Product.Instock}");
                        if (detail.Product.Instock < detail.Quantity)
                        {
                            Console.WriteLine($"❌ Không đủ hàng sản phẩm cha để khôi phục: {detail.Product.Name}");
                            return BadRequest($"Sản phẩm '{detail.Product.Name}' không đủ hàng để khôi phục đơn hàng. Chỉ còn {detail.Product.Instock} sản phẩm.");
                        }
                        detail.Product.Instock -= detail.Quantity;
                        Console.WriteLine($"✅ Khôi phục sản phẩm cha thành công: Tồn kho mới = {detail.Product.Instock}");
                        _context.Products.Update(detail.Product);
                    }
                    else
                    {
                        // Kiểm tra và trừ tồn kho sản phẩm cơ bản
                        Console.WriteLine($"🔄 Khôi phục đơn hàng sản phẩm: Kiểm tra tồn kho {detail.Product.Name} - Cần {detail.Quantity}, có {detail.Product.Instock}");
                        if (detail.Product.Instock < detail.Quantity)
                        {
                            Console.WriteLine($"❌ Không đủ hàng để khôi phục: {detail.Product.Name}");
                            return BadRequest($"Sản phẩm '{detail.Product.Name}' không đủ hàng để khôi phục đơn hàng. Chỉ còn {detail.Product.Instock} sản phẩm.");
                        }
                        detail.Product.Instock -= detail.Quantity;
                        Console.WriteLine($"✅ Khôi phục sản phẩm thành công: Tồn kho mới = {detail.Product.Instock}");
                        _context.Products.Update(detail.Product);
                    }
                }
            }

            // Lưu trạng thái cũ trước khi cập nhật
            var oldStatus = order.Status;
            
            // Cập nhật trạng thái
            order.Status = request.Status;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            // Tạo thông báo chi tiết
            string message = $"Đã cập nhật trạng thái đơn hàng thành '{request.Status}'.";
            
            if (request.Status == "Cancelled" && oldStatus != "Cancelled")
            {
                message += $" Đã hoàn lại tồn kho cho {order.OrderDetails.Count} sản phẩm.";
            }
            else if (oldStatus == "Cancelled" && request.Status != "Cancelled")
            {
                message += $" Đã trừ lại tồn kho cho {order.OrderDetails.Count} sản phẩm.";
            }

            return Ok(new { message = message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating order status: {ex.Message}");
            return StatusCode(500, "Lỗi khi cập nhật trạng thái đơn hàng.");
        }
    }

    // Admin: Xoá đơn hàng
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        try
        {
            Console.WriteLine($"Deleting order with ID: {id}");
            
            var order = await _context.Orders.FindAsync(id);
            if (order == null) 
            {
                Console.WriteLine($"Order with ID {id} not found");
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            }

            Console.WriteLine($"Found order: {order.OrderId}");

            // Xóa OrderDetails trước
            var orderDetails = _context.OrderDetails.Where(d => d.OrderId == id);
            _context.OrderDetails.RemoveRange(orderDetails);
            
            // Xóa Order
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Successfully deleted order {id}");
            return Ok(new { message = "Đã xóa đơn hàng thành công" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting order {id}: {ex.Message}");
            return StatusCode(500, new { message = "Lỗi khi xóa đơn hàng" });
        }
    }

    // 📌 Hàm tiện ích: Lấy userId từ token
    private int GetUserIdFromClaims()
    {
        var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(subClaim, out var userId) ? userId : 0;
    }
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
