using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models{
    [Table("Orders")]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderId { get; set; }

        [ForeignKey("User")]
        public int? UserId { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; } 

        [Required]
        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string Status { get; set; } = "Pending"; // Pending, Processing, Completed, Cancelled

        public User? User { get; set; }
        
        public List<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        
        public List<Payment> Payments { get; set; } = new List<Payment>();

    }
}