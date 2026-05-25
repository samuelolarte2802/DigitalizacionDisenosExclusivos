using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace DigitalizacionAPI.Models
{

    [Table("instituciones")]
    public class Institucion
    {

        [Key]
        [Column("id_institucion")]
        public int IdInstitucion { get; set; }

        [Required]
        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; }

    }
}
