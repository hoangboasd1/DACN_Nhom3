using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models{
    [Table("OrderDetails")]
    public class OrderDetail{
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderDetailId {get; set;}

        [Required]
        [ForeignKey("Order")]
        public int OrderId {get; set;}

        [Required]
        [ForeignKey("Product")]
        public int ProductId {get; set;}

        [Required]
        public int Quantity {get; set;}

        [Required]
        public decimal UnitPrice {get; set;}

        public Order? Order {get; set;}
        public Product? Product {get; set;}
    }
}