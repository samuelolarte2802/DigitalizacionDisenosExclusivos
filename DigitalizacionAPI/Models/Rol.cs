using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalizacionAPI.Models
{
    [Table("roles")]
    public class Rol
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_rol")]
        public int IdRol { get; set; }

        [Required]
        [Column("nombre_rol")]
        public string NombreRol { get; set; }

    }
}
