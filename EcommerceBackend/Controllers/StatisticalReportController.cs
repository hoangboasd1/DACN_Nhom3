using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            // Đếm tổng đơn hàng
            var totalOrders = await _context.Orders.CountAsync();

            // Đếm sản phẩm còn hàng (Instock > 0)
            var activeProducts = await _context.Products
                .CountAsync(p => p.Instock > 0);

            // Đếm tổng người dùng
            var totalUsers = await _context.Users.CountAsync();

            // Doanh thu hôm nay
            var today = DateTime.Today;
            var revenueToday = await _context.Orders
                .Where(o => o.OrderDate.Date == today)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            return Ok(new
            {
                totalOrders,
                activeProducts,
                totalUsers,
                revenueToday
            });
        }
        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopSellingProducts(int top = 5)
        {
            var result = await _context.OrderDetails
                .Include(od => od.Product)
                .GroupBy(od => new { od.ProductId, od.Product!.Name })
                .Select(g => new
                {
                    productId = g.Key.ProductId,
                    name = g.Key.Name,
                    totalSold = g.Sum(od => od.Quantity)
                })
                .OrderByDescending(x => x.totalSold)
                .Take(top)
                .ToListAsync();

            return Ok(result);
        }
        [HttpGet("revenue-by-day")]
        public async Task<IActionResult> GetRevenueByDayInMonth(int year, int month)
        {
            var data = await _context.Orders
                .Where(o => o.OrderDate.Year == year && o.OrderDate.Month == month)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    date = g.Key,
                    total = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            return Ok(data);
        }
        // Thống kê doanh thu theo tuần (7 ngày gần nhất)
        [HttpGet("revenue-by-week")]
        public async Task<IActionResult> GetRevenueByWeek()
        {
            var today = DateTime.Today;
            var weekAgo = today.AddDays(-6); // tính cả hôm nay là 7 ngày

            var data = await _context.Orders
                .Where(o => o.OrderDate.Date >= weekAgo && o.OrderDate.Date <= today)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new {
                    date = g.Key,
                    total = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            return Ok(data);
        }

        // Thống kê doanh thu theo tháng trong năm (12 tháng)
        [HttpGet("revenue-by-month")]
        public async Task<IActionResult> GetRevenueByMonth(int year)
        {
            var data = await _context.Orders
                .Where(o => o.OrderDate.Year == year)
                .GroupBy(o => o.OrderDate.Month)
                .Select(g => new {
                    month = g.Key,
                    total = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.month)
                .ToListAsync();

            return Ok(data);
        }

        // Thống kê doanh thu theo năm (các năm đã có dữ liệu)
        [HttpGet("revenue-by-year")]
        public async Task<IActionResult> GetRevenueByYear()
        {
            var data = await _context.Orders
                .GroupBy(o => o.OrderDate.Year)
                .Select(g => new {
                    year = g.Key,
                    total = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(x => x.year)
                .ToListAsync();

            return Ok(data);
        }
    }
}
