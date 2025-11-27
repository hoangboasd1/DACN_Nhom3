using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace EcommerceBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/wishlist/{userId}
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<Wishlist>>> GetUserWishlist(int userId)
        {
            try
            {
                var wishlist = await _context.Wishlists
                    .Include(w => w.Product)
                    .ThenInclude(p => p.Category)
                    .Where(w => w.UserId == userId)
                    .OrderByDescending(w => w.CreatedAt)
                    .ToListAsync();

                Console.WriteLine($"Found {wishlist.Count} wishlist items for user {userId}");
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting wishlist for user {userId}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách yêu thích" });
            }
        }

        // POST: api/wishlist
        [HttpPost]
        public async Task<ActionResult<Wishlist>> AddToWishlist([FromBody] WishlistRequest request)
        {
            try
            {
                Console.WriteLine($"Adding to wishlist - UserId: {request.UserId}, ProductId: {request.ProductId}");
                
                // Check if item already exists in wishlist
                var existingItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId);

                if (existingItem != null)
                {
                    Console.WriteLine("Item already exists in wishlist");
                    return BadRequest(new { message = "Sản phẩm đã có trong danh sách yêu thích" });
                }

                var wishlistItem = new Wishlist
                {
                    UserId = request.UserId,
                    ProductId = request.ProductId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Wishlists.Add(wishlistItem);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Successfully added wishlist item with ID: {wishlistItem.Id}");

                // Return the wishlist item with product details
                var result = await _context.Wishlists
                    .Include(w => w.Product)
                    .ThenInclude(p => p.Category)
                    .FirstOrDefaultAsync(w => w.Id == wishlistItem.Id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding to wishlist: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi thêm vào danh sách yêu thích" });
            }
        }

        // DELETE: api/wishlist/{userId}/{productId}
        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> RemoveFromWishlist(int userId, int productId)
        {
            var wishlistItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (wishlistItem == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm trong danh sách yêu thích" });
            }

            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sản phẩm khỏi danh sách yêu thích" });
        }

        // GET: api/wishlist/{userId}/check/{productId}
        [HttpGet("{userId}/check/{productId}")]
        public async Task<ActionResult<bool>> CheckWishlistItem(int userId, int productId)
        {
            var exists = await _context.Wishlists
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            return Ok(exists);
        }
    }

    public class WishlistRequest
    {
        public int UserId { get; set; }
        public int ProductId { get; set; }
    }
}
