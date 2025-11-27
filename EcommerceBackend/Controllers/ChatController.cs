using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace EcommerceBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        
        public ChatController(AppDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("messages/{otherUserId}")]
        public async Task<IActionResult> GetMessages(int otherUserId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }
            
            var messages = await _context.Chats
                .Include(c => c.Sender)
                .Where(c => (c.SenderId == userId && c.ReceiverId == otherUserId) ||
                           (c.SenderId == otherUserId && c.ReceiverId == userId))
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    id = c.Id,
                    senderId = c.SenderId,
                    senderName = c.Sender!.FullName,
                    message = c.Message,
                    createdAt = c.CreatedAt,
                    isRead = c.IsRead,
                    isFromAdmin = c.IsFromAdmin
                })
                .ToListAsync();
                
            return Ok(messages);
        }
        
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            
            if (user.Role == "Admin")
            {
                // Admin xem tất cả cuộc hội thoại với users
                var adminConversations = await _context.Chats
                    .Include(c => c.Sender)
                    .Include(c => c.Receiver)
                    .Where(c => c.SenderId == userId || c.ReceiverId == userId)
                    .GroupBy(c => c.SenderId == userId ? c.ReceiverId : c.SenderId)
                    .Select(g => new
                    {
                        otherUserId = g.Key,
                        otherUserName = g.First().SenderId == userId ? g.First().Receiver!.FullName : g.First().Sender!.FullName,
                        lastMessage = g.OrderByDescending(c => c.CreatedAt).First().Message,
                        lastMessageTime = g.OrderByDescending(c => c.CreatedAt).First().CreatedAt,
                        unreadCount = g.Count(c => c.ReceiverId == userId && !c.IsRead)
                    })
                    .OrderByDescending(c => c.lastMessageTime)
                    .ToListAsync();
                    
                return Ok(adminConversations);
            }
            else
            {
                // User xem cuộc hội thoại với các admin đã từng nhắn tin
                var userConversations = await _context.Chats
                    .Include(c => c.Sender)
                    .Include(c => c.Receiver)
                    .Where(c => (c.SenderId == userId && c.Receiver!.Role == "Admin") ||
                               (c.ReceiverId == userId && c.Sender!.Role == "Admin"))
                    .GroupBy(c => c.SenderId == userId ? c.ReceiverId : c.SenderId)
                    .Select(g => new
                    {
                        otherUserId = g.Key,
                        otherUserName = g.First().SenderId == userId ? g.First().Receiver!.FullName : g.First().Sender!.FullName,
                        lastMessage = g.OrderByDescending(c => c.CreatedAt).First().Message,
                        lastMessageTime = g.OrderByDescending(c => c.CreatedAt).First().CreatedAt,
                        unreadCount = g.Count(c => c.ReceiverId == userId && !c.IsRead)
                    })
                    .OrderByDescending(c => c.lastMessageTime)
                    .ToListAsync();
                    
                // Nếu chưa có cuộc hội thoại nào, tạo một cuộc hội thoại với admin đầu tiên
                if (!userConversations.Any())
                {
                    var admin = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
                    if (admin == null) return Ok(new List<object>());
                    
                    var conversation = new
                    {
                        otherUserId = admin.Id,
                        otherUserName = admin.FullName,
                        lastMessage = "",
                        lastMessageTime = DateTime.Now,
                        unreadCount = 0
                    };
                    
                    return Ok(new[] { conversation });
                }
                
                return Ok(userConversations);
            }
        }
        
        [HttpPost("mark-read/{otherUserId}")]
        public async Task<IActionResult> MarkMessagesAsRead(int otherUserId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }
            
            var messages = await _context.Chats
                .Where(c => c.SenderId == otherUserId && c.ReceiverId == userId && !c.IsRead)
                .ToListAsync();
                
            foreach (var message in messages)
            {
                message.IsRead = true;
            }
            
            await _context.SaveChangesAsync();
            
            return Ok();
        }
        
        [HttpGet("admin/users")]
        [Authorize]
        public async Task<IActionResult> GetUsersForAdmin()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "Admin")
            {
                return Forbid();
            }
            
            var users = await _context.Users
                .Where(u => u.Role != "Admin")
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName,
                    email = u.Username
                })
                .ToListAsync();
                
            return Ok(users);
        }
        
        [HttpDelete("conversation/{otherUserId}")]
        [Authorize]
        public async Task<IActionResult> DeleteConversation(int otherUserId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }
            
            // Xóa tất cả tin nhắn giữa 2 user
            var messages = await _context.Chats
                .Where(c => (c.SenderId == userId && c.ReceiverId == otherUserId) ||
                           (c.SenderId == otherUserId && c.ReceiverId == userId))
                .ToListAsync();
                
            _context.Chats.RemoveRange(messages);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Cuộc hội thoại đã được xóa thành công" });
        }
    }
}
