using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class CreateProductRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Instock { get; set; }

        public string? ImageUrl { get; set; }

        public string? Gender { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? ClothingTypeId { get; set; }

        public List<int> MaterialIds { get; set; } = new List<int>();
    }

    public class UpdateProductRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Instock { get; set; }

        public string? ImageUrl { get; set; }

        public string? Gender { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? ClothingTypeId { get; set; }

        public List<int> MaterialIds { get; set; } = new List<int>();
    }
}
