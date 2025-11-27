using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Models;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        //Tạo mới người dùng (User)
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(
            [FromBody] CreateUserRequest request)
        {
            //Kiểm tra xem Username đã tồn tại chưa
            if (await _context.Users.AnyAsync(
                u => u.Username == request.Username))
                return BadRequest("Username đã tồn tại.");

            var user = new User
            {
                Username = request.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(
                                        request.Password),
                FullName = request.FullName,
                Role = "nguoidung", // Mặc định là người dùng
                Phone = request.Phone,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser),
                            new { id = user.Id }, user);
        }

        //Lấy người dùng
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            return user;
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            try
            {
                Console.WriteLine("GetCurrentUser called");
                Console.WriteLine($"User claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"))}");
                
                // Try both claim types to be safe
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
                if (userIdClaim == null)
                {
                    Console.WriteLine("No userId claim found");
                    return Unauthorized();
                }

                Console.WriteLine($"Found userId claim: {userIdClaim.Value}");
                
                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    Console.WriteLine($"Failed to parse userId: {userIdClaim.Value}");
                    return Unauthorized();
                }

                Console.WriteLine($"Parsed userId: {userId}");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    Console.WriteLine($"User not found with ID: {userId}");
                    return NotFound();
                }

                Console.WriteLine($"Found user: {user.Username} (ID: {user.Id})");
                return user;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCurrentUser: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin user" });
            }
        }
        //Lấy tất cả user
        [HttpGet("getAll")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        //Xóa user
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound("Không tìm thấy người dùng.");

                Console.WriteLine($"🗑️ Bắt đầu xóa user: {user.Username} (ID: {id})");

                // Xóa tất cả dữ liệu liên quan trước khi xóa user
                
                // 1. Xóa Cart items
                var cartItems = await _context.Carts.Where(c => c.UserId == id).ToListAsync();
                if (cartItems.Any())
                {
                    _context.Carts.RemoveRange(cartItems);
                    Console.WriteLine($"🗑️ Đã xóa {cartItems.Count} cart items");
                }

                // 2. Xóa Addresses
                var addresses = await _context.Addresses.Where(a => a.UserId == id).ToListAsync();
                if (addresses.Any())
                {
                    _context.Addresses.RemoveRange(addresses);
                    Console.WriteLine($"🗑️ Đã xóa {addresses.Count} addresses");
                }

                // 3. Xóa Chat messages (cả sender và receiver)
                var chatMessages = await _context.Chats
                    .Where(c => c.SenderId == id || c.ReceiverId == id)
                    .ToListAsync();
                if (chatMessages.Any())
                {
                    _context.Chats.RemoveRange(chatMessages);
                    Console.WriteLine($"🗑️ Đã xóa {chatMessages.Count} chat messages");
                }

                // 4. Xóa Wishlist items
                var wishlistItems = await _context.Wishlists.Where(w => w.UserId == id).ToListAsync();
                if (wishlistItems.Any())
                {
                    _context.Wishlists.RemoveRange(wishlistItems);
                    Console.WriteLine($"🗑️ Đã xóa {wishlistItems.Count} wishlist items");
                }

                // 5. Giữ lại Orders nhưng set UserId = NULL để bảo toàn lịch sử bán hàng
                var orders = await _context.Orders.Where(o => o.UserId == id).ToListAsync();
                if (orders.Any())
                {
                    foreach (var order in orders)
                    {
                        order.UserId = null; // Set về NULL để giữ lại order nhưng không liên kết với user
                        order.User = null; // Xóa navigation property
                    }
                    Console.WriteLine($"📦 Đã cập nhật {orders.Count} orders - set UserId = NULL để giữ lại lịch sử bán hàng");
                }

                // 6. Giữ nguyên Payments - không xóa để bảo toàn lịch sử thanh toán
                var payments = await _context.Payments.Where(p => orders.Select(o => o.OrderId).Contains(p.OrderId)).ToListAsync();
                if (payments.Any())
                {
                    Console.WriteLine($"💰 Đã giữ lại {payments.Count} payments để bảo toàn lịch sử thanh toán");
                }

                // 8. Cuối cùng xóa User
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Đã xóa user thành công: {user.Username}");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi khi xóa user: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Lỗi khi xóa người dùng", error = ex.Message });
            }
        }
        [HttpPost("{id}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("Không tìm thấy người dùng.");

            // Kiểm tra mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.Password))
                return BadRequest("Mật khẩu cũ không đúng.");

            // Đổi mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Đổi mật khẩu thành công!");
        }

        //Test endpoint để kiểm tra kết nối
        [HttpGet("test")]
        public IActionResult TestEndpoint()
        {
            return Ok("API endpoint hoạt động bình thường!");
        }

        //Cập nhật thông tin người dùng
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                Console.WriteLine($"🔄 UpdateUser called - ID: {id}");
                Console.WriteLine($"📝 Request data: FullName={request?.FullName}, Phone={request?.Phone}, IsActive={request?.IsActive}");
                
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    Console.WriteLine($"❌ User not found with ID: {id}");
                    return NotFound("Không tìm thấy người dùng.");
                }

                Console.WriteLine($"👤 Found user: {user.Username}, Current IsActive: {user.IsActive}");

                // Kiểm tra quyền: chỉ admin hoặc chính user đó mới được sửa
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                {
                    Console.WriteLine("❌ Cannot determine current user ID");
                    return Unauthorized("Không thể xác định người dùng.");
                }

                var currentUser = await _context.Users.FindAsync(currentUserId.Value);
                if (currentUser == null)
                {
                    Console.WriteLine($"❌ Current user not found with ID: {currentUserId.Value}");
                    return Unauthorized("Không tìm thấy thông tin người dùng hiện tại.");
                }

                Console.WriteLine($"🔑 Current user: {currentUser.Username}, Role: {currentUser.Role}");

                // Chỉ cho phép admin sửa tất cả user, hoặc user sửa chính mình
                if (currentUser.Role != "Admin" && currentUserId.Value != id)
                {
                    Console.WriteLine($"❌ Permission denied: User {currentUser.Username} cannot update user {id}");
                    return Forbid("Bạn không có quyền cập nhật thông tin người dùng này.");
                }

                // Cập nhật thông tin - chỉ cập nhật các field được cung cấp và hợp lệ
                if (request.FullName != null && !string.IsNullOrWhiteSpace(request.FullName))
                {
                    // Validate FullName length
                    if (request.FullName.Length > 100)
                    {
                        Console.WriteLine($"❌ FullName too long: {request.FullName.Length} characters");
                        return BadRequest("Tên không được vượt quá 100 ký tự");
                    }
                    user.FullName = request.FullName.Trim();
                    Console.WriteLine($"✅ Updated FullName to: {user.FullName}");
                }
                
                if (request.Phone != null && !string.IsNullOrWhiteSpace(request.Phone))
                {
                    // Validate Phone length
                    if (request.Phone.Length > 20)
                    {
                        Console.WriteLine($"❌ Phone too long: {request.Phone.Length} characters");
                        return BadRequest("Số điện thoại không được vượt quá 20 ký tự");
                    }
                    user.Phone = request.Phone.Trim();
                    Console.WriteLine($"✅ Updated Phone to: {user.Phone}");
                }

                if (currentUser.Role == "Admin" && request.IsActive.HasValue)
                {
                    user.IsActive = request.IsActive.Value;
                    Console.WriteLine($"✅ Updated IsActive to: {request.IsActive.Value}");
                }
                else if (request.IsActive.HasValue && currentUser.Role != "Admin")
                {
                    Console.WriteLine($"❌ Non-admin user trying to update IsActive");
                    return Forbid("Chỉ admin mới có thể thay đổi trạng thái hoạt động của tài khoản.");
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ User updated successfully: {user.Username}");
                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in UpdateUser: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        //Toggle trạng thái hoạt động của user (chỉ admin)
        [HttpPut("{id}/toggle-status")]
        [Authorize]
        public async Task<IActionResult> ToggleUserStatus(int id, [FromBody] ToggleStatusRequest request)
        {
            try
            {
                Console.WriteLine($"🔄 ToggleUserStatus called - ID: {id}, IsActive: {request?.IsActive}");
                
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    Console.WriteLine($"❌ User not found with ID: {id}");
                    return NotFound("Không tìm thấy người dùng.");
                }

                Console.WriteLine($"👤 Found user: {user.Username}, Current IsActive: {user.IsActive}");

                // Kiểm tra quyền: chỉ admin mới được toggle status
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                {
                    Console.WriteLine("❌ Cannot determine current user ID");
                    return Unauthorized("Không thể xác định người dùng.");
                }

                var currentUser = await _context.Users.FindAsync(currentUserId.Value);
                if (currentUser == null)
                {
                    Console.WriteLine($"❌ Current user not found with ID: {currentUserId.Value}");
                    return Unauthorized("Không tìm thấy thông tin người dùng hiện tại.");
                }

                Console.WriteLine($"🔑 Current user: {currentUser.Username}, Role: {currentUser.Role}");

                // Chỉ admin mới được toggle status
                if (currentUser.Role != "Admin")
                {
                    Console.WriteLine($"❌ Permission denied: User {currentUser.Username} cannot toggle status");
                    return Forbid("Chỉ admin mới có thể thay đổi trạng thái hoạt động của tài khoản.");
                }

                // Toggle status
                user.IsActive = request.IsActive;
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ User status toggled successfully: {user.Username} -> IsActive: {user.IsActive}");
                return Ok(new { 
                    message = "Cập nhật trạng thái thành công!", 
                    user = new { 
                        id = user.Id, 
                        username = user.Username, 
                        isActive = user.IsActive 
                    } 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in ToggleUserStatus: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        //Cập nhật quyền người dùng (chỉ admin)
        [HttpPut("{id}/role")]
        [Authorize]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                Console.WriteLine($"🔄 UpdateUserRole called - ID: {id}, Role: {request?.Role}");
                
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    Console.WriteLine($"❌ User not found with ID: {id}");
                    return NotFound("Không tìm thấy người dùng.");
                }

                Console.WriteLine($"👤 Found user: {user.Username}, Current role: {user.Role}");

                // Kiểm tra quyền hợp lệ - chấp nhận cả "Admin" và "admin"
                var normalizedRole = request.Role;
                if (normalizedRole != "Admin" && normalizedRole != "admin" && normalizedRole != "nguoidung")
                {
                    Console.WriteLine($"❌ Invalid role: {request.Role}");
                    return BadRequest("Quyền không hợp lệ. Chỉ có thể là 'Admin' hoặc 'nguoidung'.");
                }

                // Chuẩn hóa "admin" thành "Admin" để khớp với database
                if (normalizedRole?.ToLower() == "admin")
                {
                    normalizedRole = "Admin";
                }

                user.Role = normalizedRole;
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Role updated successfully for user {user.Username} to {normalizedRole}");
                return Ok("Cập nhật quyền thành công!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in UpdateUserRole: {ex.Message}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // Lấy thông tin thống kê khách hàng theo ID (cho admin)
        [HttpGet("{id}/stats")]
        [Authorize]
        public async Task<IActionResult> GetCustomerStats(int id)
        {
            try
            {
                // Kiểm tra quyền admin
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                    return Unauthorized("Không thể xác định người dùng.");

                var currentUser = await _context.Users.FindAsync(currentUserId.Value);
                if (currentUser == null || currentUser.Role != "Admin")
                    return Forbid("Chỉ admin mới có thể xem thống kê khách hàng.");

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound("Không tìm thấy khách hàng.");

                // Lấy thống kê orders
                var totalOrders = await _context.Orders
                    .Where(o => o.UserId == id)
                    .CountAsync();

                var totalSpent = await _context.Orders
                    .Where(o => o.UserId == id && o.Status == "Completed")
                    .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

                var lastOrderDate = await _context.Orders
                    .Where(o => o.UserId == id)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => o.OrderDate)
                    .FirstOrDefaultAsync();

                var joinDate = DateTime.Now; // Sử dụng ngày hiện tại thay vì CreatedAt

                return Ok(new
                {
                    userId = user.Id,
                    username = user.Username,
                    fullName = user.FullName,
                    phone = user.Phone,
                    isActive = user.IsActive,
                    joinDate = joinDate.ToString("dd/MM/yyyy"),
                    totalOrders,
                    totalSpent,
                    lastOrderDate = lastOrderDate.ToString("dd/MM/yyyy"),
                    lastActive = user.IsActive ? "Hoạt động" : "Không hoạt động"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in GetCustomerStats: {ex.Message}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // Lấy danh sách orders của khách hàng theo ID (cho admin)
        [HttpGet("{id}/orders")]
        [Authorize]
        public async Task<IActionResult> GetCustomerOrders(int id)
        {
            try
            {
                // Kiểm tra quyền admin
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                    return Unauthorized("Không thể xác định người dùng.");

                var currentUser = await _context.Users.FindAsync(currentUserId.Value);
                if (currentUser == null || currentUser.Role != "Admin")
                    return Forbid("Chỉ admin mới có thể xem đơn hàng của khách hàng.");

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound("Không tìm thấy khách hàng.");

                var orders = await _context.Orders
                    .Where(o => o.UserId == id)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in GetCustomerOrders: {ex.Message}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ToggleStatusRequest
    {
        public bool IsActive { get; set; }
    }
}