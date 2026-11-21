using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace DigitalizacionAPI.Models
{

    [Table("pedidos")]
    public class Pedido
    {

        [Key]
        [Column("id_pedido")]
        public int IdPedido { get; set; }

        [Required]
        [Column("id_cliente")]
        public int IdCliente { get; set; }

        [Column("tipo_producto")]
        public string? TipoProducto { get; set; }

        [Column("piezas")]
        public JsonElement? Piezas { get; set; }

        [Column("medidas_especificas")]
        public JsonElement? MedidasEspecificas { get; set; }

        [Column("fecha_entrega")]
        public DateTime? FechaEntrega { get; set; }

        [Column("responsable_pago")]
        public string? ResponsablePago { get; set; }

        [Column("fecha_pedido")]
        public DateTime? FechaPedido { get; set; }

        [Required]
        [Column("total_pagar")]
        public decimal TotalPagar { get; set; }

        [Column("abono")]
        public decimal Abono { get; set; }

        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("estado_pago")]
        public string EstadoPago { get; set; }

    }
}
