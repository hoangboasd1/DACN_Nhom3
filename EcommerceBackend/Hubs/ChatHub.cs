using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceBackend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        
        public ChatHub(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task JoinRoom(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        
        public async Task LeaveRoom(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        
        public async Task SendMessageToUser(int receiverId, string message)
        {
            var senderIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(senderIdClaim, out int senderId))
            {
                return;
            }
            
            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null) return;
            
            var chat = new Chat
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message,
                CreatedAt = DateTime.Now,
                IsFromAdmin = sender.Role == "Admin"
            };
            
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            
            // Gửi tin nhắn đến người nhận (chỉ khi người nhận khác người gửi)
            if (receiverId != senderId)
            {
                await Clients.Group($"User_{receiverId}").SendAsync("ReceiveMessage", new
                {
                    id = chat.Id,
                    senderId = senderId,
                    senderName = sender.FullName,
                    message = message,
                    createdAt = chat.CreatedAt,
                    isFromAdmin = chat.IsFromAdmin
                });
            }
            
            // Gửi tin nhắn đến người gửi để hiển thị (confirmation)
            await Clients.Group($"User_{senderId}").SendAsync("ReceiveMessage", new
            {
                id = chat.Id,
                senderId = senderId,
                senderName = sender.FullName,
                message = message,
                createdAt = chat.CreatedAt,
                isFromAdmin = chat.IsFromAdmin
            });
        }
        
        public async Task SendMessageToAdmin(string message)
        {
            var senderIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(senderIdClaim, out int senderId))
            {
                return;
            }
            
            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null) return;
            
            // Tìm admin đầu tiên
            var admin = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
            if (admin == null) return;
            
            var chat = new Chat
            {
                SenderId = senderId,
                ReceiverId = admin.Id,
                Message = message,
                CreatedAt = DateTime.Now,
                IsFromAdmin = false
            };
            
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            
            // Gửi tin nhắn đến admin (chỉ khi admin khác người gửi)
            if (admin.Id != senderId)
            {
                await Clients.Group($"User_{admin.Id}").SendAsync("ReceiveMessage", new
                {
                    id = chat.Id,
                    senderId = senderId,
                    senderName = sender.FullName,
                    message = message,
                    createdAt = chat.CreatedAt,
                    isFromAdmin = false
                });
            }
            
            // Gửi tin nhắn đến người gửi để hiển thị (confirmation)
            await Clients.Group($"User_{senderId}").SendAsync("ReceiveMessage", new
            {
                id = chat.Id,
                senderId = senderId,
                senderName = sender.FullName,
                message = message,
                createdAt = chat.CreatedAt,
                isFromAdmin = false
            });
        }
        
        public async Task MarkMessagesAsRead(int otherUserId)
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return;
            }
            
            var messages = await _context.Chats
                .Where(c => c.SenderId == otherUserId && c.ReceiverId == userId && !c.IsRead)
                .ToListAsync();
                
            foreach (var message in messages)
            {
                message.IsRead = true;
            }
            
            await _context.SaveChangesAsync();
            
            // Thông báo cho người gửi rằng tin nhắn đã được đọc
            await Clients.Group($"User_{otherUserId}").SendAsync("MessagesRead", userId);
        }
        
        public override async Task OnConnectedAsync()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnConnectedAsync();
        }
        
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
