using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models{
    [Table("Carts")]
    public class Cart
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CartItemId {get; set;}

        [Required]
        [ForeignKey("User")]
        public int UserId {get; set;}

        [Required]
        [ForeignKey("Product")]
        public int ProductId {get; set;}

        [Required]
        public int Quantity {get; set;}

        public DateTime CreatedAt {get; set;} = DateTime.Now;

        public User? User {get; set;}
        public Product? Product {get; set;}

    }
}