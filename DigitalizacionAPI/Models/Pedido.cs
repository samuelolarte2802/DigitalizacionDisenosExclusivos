using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
