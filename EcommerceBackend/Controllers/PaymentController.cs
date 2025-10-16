using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class PaymentController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentController(AppDbContext context)
    {
        _context = context;
    }

    // Tạo thanh toán mới (chỉ user đăng nhập)
    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId && o.UserId == userId);
        if (order == null)
            return BadRequest("Đơn hàng không tồn tại hoặc không thuộc về bạn");

        var newPayment = new Payment
        {
            OrderId = dto.OrderId,
            PaymentMethod = dto.PaymentMethod,
            Amount = dto.Amount,
            TransactionId = dto.TransactionId,
            PaymentGateway = dto.PaymentGateway,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(newPayment);
        await _context.SaveChangesAsync();

        return Ok(newPayment);
    }

    // Lấy tất cả thanh toán
    // - Nếu là user đã đăng nhập -> chỉ thấy thanh toán của mình
    // - Nếu không có user (hoặc hệ thống gọi) -> thấy tất cả
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdClaim, out var userId) && userId > 0)
        {
            var mine = await _context.Payments
                .Where(p => p.Order.UserId == userId)
                .Include(p => p.Order)
                .ToListAsync();
            return Ok(mine);
        }

        var all = await _context.Payments
            .Include(p => p.Order)
            .ToListAsync();
        return Ok(all);
    }

    // Lấy chi tiết thanh toán theo ID
    // - Nếu là user: chỉ được xem thanh toán của mình
    // - Nếu không có userId: được phép xem tất cả
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        if (payment == null)
            return NotFound();

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdClaim, out var userId) && userId > 0)
        {
            if (payment.Order.UserId != userId)
                return Forbid();
        }

        return Ok(payment);
    }
    // Lấy thông tin thanh toán theo OrderId
    // - User chỉ được xem thanh toán của đơn hàng thuộc về mình
    [HttpGet("order/{orderId}")]
    [Authorize]
    public async Task<IActionResult> GetByOrderId(int orderId)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == orderId);

        if (payment == null)
            return NotFound("Không tìm thấy thanh toán cho đơn hàng này");

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdClaim, out var userId) && userId > 0)
        {
            if (payment.Order.UserId != userId)
                return Forbid();
        }

        return Ok(payment);
    }

    // Cập nhật trạng thái thanh toán (chỉ chủ đơn hàng hoặc hệ thống gọi)
    [HttpPut("update-status/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] PaymentStatus newStatus)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        if (payment == null)
            return NotFound("Không tìm thấy thanh toán");

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdClaim, out var userId) && userId > 0)
        {
            if (payment.Order.UserId != userId)
                return Forbid();
        }

        payment.Status = newStatus;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái thành công!", payment });
    }
    public class CreatePaymentDto
    {
        public int OrderId { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public int Amount { get; set; }
        public string? PaymentGateway { get; set; }
        public string? TransactionId { get; set; }
    }

}
