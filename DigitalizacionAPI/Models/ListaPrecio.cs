using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalizacionAPI.Models
{

    [Table("lista_precios")]
    public class ListaPrecio
    {

        [Key]
        [Column("id_precio")]
        public int IdPrecio { get; set; }

        [Column("id_institucion")]
        public int? IdInstitucion { get; set; }

        [Required]
        [Column("tipo_prenda")]
        public string TipoPrenda { get; set; }

        [Required]
        [Column("talla")]
        public string Talla { get; set; }

        [Required]
        [Column("precio")]
        public decimal Precio { get; set; }

        [Required]
        [Column("anio_vigencia")]
        public int AnioVigencia { get; set; }

    }
}
