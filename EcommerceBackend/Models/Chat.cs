using System.ComponentModel.DataAnnotations;
using Models;

namespace Models
{
    public class Chat
    {
        public int Id { get; set; }
        
        [Required]
        public int SenderId { get; set; }
        
        [Required]
        public int ReceiverId { get; set; }
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public bool IsRead { get; set; } = false;
        
        public bool IsFromAdmin { get; set; } = false;
        
        // Navigation properties
        public User? Sender { get; set; }
        public User? Receiver { get; set; }
    }
}
