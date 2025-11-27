using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("ProductVariants")]
    public class ProductVariant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        [ForeignKey("Color")]
        public int ColorId { get; set; }

        [Required]
        [ForeignKey("Size")]
        public int SizeId { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public int StockQuantity { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PriceAdjustment { get; set; } = null; // Điều chỉnh giá so với giá gốc

        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string? ImageUrl { get; set; } // Ảnh riêng cho biến thể này

        [StringLength(50)]
        [Column(TypeName = "varchar(50)")]
        public string? SKU { get; set; } // Mã SKU riêng cho biến thể

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public Product? Product { get; set; }
        public Color? Color { get; set; }
        public Size? Size { get; set; }

        // Computed property
        [NotMapped]
        public decimal FinalPrice => Product?.Price + (PriceAdjustment ?? 0) ?? 0;
    }
}
