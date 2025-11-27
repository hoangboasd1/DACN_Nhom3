using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("ProductMaterials")]
    public class ProductMaterial
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        [ForeignKey("Material")]
        public int MaterialId { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? Percentage { get; set; } // Phần trăm chất liệu trong sản phẩm

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Product Product { get; set; }
        public Material Material { get; set; }
    }
}
