using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class CreateOrderRequest
    {
        [Required]
        [StringLength(500)]
        public string DeliveryAddress { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Note { get; set; }
    }
}
