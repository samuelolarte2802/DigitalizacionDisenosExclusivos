using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace DigitalizacionAPI.Models
{

    [Table("detalle_pedido")]
    public class DetallePedido
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] 
        [Column("id_detalle")]
        public int IdDetalle { get; set; }

        [Column("id_pedido")]
        public int? IdPedido { get; set; }

        [Column("id_institucion")]
        public int? IdInstitucion { get; set; }

        [Column("nombre_beneficiario")]
        public string NombreBeneficiario { get; set; }

        [Required]
        [Column("tipo_prenda")]
        public string TipoPrenda { get; set; }

        [Column("piezas_incluidas", TypeName = "jsonb")]
        public JsonDocument PiezasIncluidas { get; set; }

        [Column("tipo_tela")]
        public string TipoTela { get; set; }

        [Column("talla_general")]
        public string TallaGeneral { get; set; }

        [Required]
        [Column("talla_cobro")]
        public string TallaCobro { get; set; }

        [Column("medidas_especificas", TypeName = "jsonb")]
        public JsonDocument MedidasEspecificas { get; set; }

        [Required]
        [Column("precio_congelado")]
        public decimal PrecioCongelado { get; set; }

        [Required]
        [Column("fecha_pedido")]
        public DateTime FechaPedido { get; set; }

        [Required]
        [Column("estado_pedido")]
        public string EstadoPedido { get; set; }

    }
}
