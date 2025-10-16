using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    public enum PaymentStatus{
            Pending,
            Paid,
            Failed,
            Refunded
    }

    [Table("Payments")]

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } // "COD" hoặc "BankTransfer"

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } // Số tiền thanh toán (có thể giống TotalAmount bên Order)

        [MaxLength(100)]
        public string? TransactionId { get; set; } // Mã giao dịch ngân hàng (nếu có)

        [MaxLength(50)]
        public string? PaymentGateway { get; set; } // Ví dụ: "Vietcombank", "Techcombank", v.v.

        [Required]
        public PaymentStatus Status { get; set; } // "Pending", "Paid", "Failed", "Refunded", v.v.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}