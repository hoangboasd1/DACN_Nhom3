using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Models;

namespace Controllers{
    [Route("api/Cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CartController(AppDbContext context)
        {
            _context = context;
        }

        //Thêm sản phẩm vào giỏ hàng
        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] CartRequest request)
        {

            var userId = GetUserIdFromToken();
            Console.WriteLine("User Id: " + userId);
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            //Lấy sản phẩm
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm.");

            // Nếu có ProductVariantId, kiểm tra biến thể
            ProductVariant? variant = null;
            if (request.ProductVariantId.HasValue)
            {
                variant = await _context.ProductVariants
                    .Include(pv => pv.Color)
                    .Include(pv => pv.Size)
                    .FirstOrDefaultAsync(pv => pv.Id == request.ProductVariantId.Value && pv.ProductId == request.ProductId);
                
                if (variant == null)
                    return NotFound("Không tìm thấy biến thể sản phẩm.");
                
                if (!variant.IsActive)
                    return BadRequest("Biến thể sản phẩm không khả dụng.");
            }

            // Kiểm tra tồn kho
            int availableStock = variant?.StockQuantity ?? product.Instock;
            if (availableStock <= 0)
                return BadRequest("Sản phẩm đã hết hàng.");

            //Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng chưa
            var existingCart = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == request.ProductId && c.ProductVariantId == request.ProductVariantId);
            
            int newQuantity = existingCart != null ? existingCart.Quantity + request.Quantity : request.Quantity;
            
            // Kiểm tra tổng số lượng trong giỏ hàng không vượt quá tồn kho
            if (newQuantity > availableStock)
                return BadRequest($"Số lượng vượt quá tồn kho. Chỉ còn {availableStock} sản phẩm.");

            if (existingCart != null)
            {
                existingCart.Quantity = newQuantity;
                _context.Carts.Update(existingCart);
            }
            else
            {
                var cart = new Cart
                {
                    UserId = (int)userId,
                    ProductId = request.ProductId,
                    ProductVariantId = request.ProductVariantId,
                    Quantity = request.Quantity,
                    CreatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm hàng vào giỏ hàng thành công." });

        }

        private int? GetUserIdFromToken()
        {
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
            }
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");  // Lấy giá trị từ claim 'sub'
            Console.WriteLine("UserIdClaim: " + User.ToString());
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
        }

        //Lấy giỏ hàng của khách hàng
        [HttpGet("get")]
        [Authorize]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .Include(c => c.ProductVariant)
                    .ThenInclude(pv => pv.Color)
                .Include(c => c.ProductVariant)
                    .ThenInclude(pv => pv.Size)
                .ToListAsync();

            if (!cartItems.Any())
                return Ok(cartItems);

            return Ok(cartItems);
        }

        //Thay đổi số lượng sản phẩm trong giỏ hàng
        [HttpPut("update-quantity")]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromBody] CartRequest request)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            Console.WriteLine("ProductId: " + request.ProductId);
            Console.WriteLine(request.Quantity);

            var cartItem = await _context.Carts
                .Include(c => c.Product)
                .Include(c => c.ProductVariant)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == request.ProductId && c.ProductVariantId == request.ProductVariantId);
            
            if (cartItem == null)
                return NotFound("Không tìm thấy sản phẩm trong giỏ hàng.");

            // Kiểm tra tồn kho
            int availableStock = cartItem.ProductVariant?.StockQuantity ?? cartItem.Product.Instock;
            if (availableStock <= 0)
                return BadRequest("Sản phẩm đã hết hàng.");

            if (request.Quantity > availableStock)
                return BadRequest($"Số lượng vượt quá tồn kho. Chỉ còn {availableStock} sản phẩm.");

            cartItem.Quantity = request.Quantity;
            _context.Carts.Update(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật số lượng thành công." });
        }
        //Xoá sản phẩm khỏi giỏ hàng
        [HttpDelete("delete/{productId}")]
        [Authorize]
        public async Task<IActionResult> DeleteFromCart(int productId, [FromQuery] int? productVariantId = null)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            var cartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId && c.ProductVariantId == productVariantId);

            if (cartItem == null)
                return NotFound("Không tìm thấy sản phẩm trong giỏ hàng.");

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xoá sản phẩm khỏi giỏ hàng." });
        }
    }

    public class CartRequest{
        public int ProductId {get; set;}
        public int Quantity {get; set;}
        public int? ProductVariantId {get; set;}
    }
}