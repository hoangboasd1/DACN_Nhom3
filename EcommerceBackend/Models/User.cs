using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models{
    [Table("Users")]
    public class User{

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id {get; set;}

        [Required]
        [StringLength(50)]
        [Column(TypeName = "varchar(50)")]
        public string Username {get; set;}

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string Password {get; set;}

        [Required]
        public string FullName {get; set;}

        [Required]
        [Column(TypeName = "varchar(20)")]
        public string Role {get; set;}

        [StringLength(20)]
        [Column(TypeName = "varchar(20)")]
        public string Phone {get; set;}

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatAt {get; set;} = DateTime.UtcNow;

        public bool IsActive {get; set;} = true;

    }
}