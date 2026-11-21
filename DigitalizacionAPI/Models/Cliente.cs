using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace DigitalizacionAPI.Models
{

    [Table("clientes")]
    public class Cliente
    {

        [Key]
        [Column("id_cliente")]
        public int IdCliente { get; set; }

        [Required]
        [Column("nombre_completo")]
        public string NombreCompleto { get; set; }

        [Required]
        [Column("celular")]
        public string Celular { get; set; }

        [Column("alias_cliente")]
        public string? AliasCliente { get; set; }

        [Column("tipo_cliente")]
        public string TipoCliente { get; set; } = "Adulto";

        [Column("nombre_responsable")]
        public string? NombreResponsable { get; set; }

        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; }

        [Column("medidas", TypeName = "jsonb")]
        public JsonElement Medidas { get; set; } 

    }
}
