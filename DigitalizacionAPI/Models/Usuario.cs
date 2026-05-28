using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalizacionAPI.Models
{

    [Table("usuarios")]
    public class Usuario
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Required]
        [Column("id_rol")]
        public int IdRol { get; set; }

        [Required]
        [Column("nombre")]
        public string Nombre { get; set; }

        [Required]
        [Column("credencial_hash")]
        public string CredencialHash { get; set; }
        
        [Required]
        [Column("correo")]
        public string Correo { get; set; }

    }
}
