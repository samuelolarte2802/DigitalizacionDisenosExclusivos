using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalizacionAPI.Models
{

    [Table("proveedores")]
    public class Proveedor
    {

        [Key]
        [Column("id_proveedor")]
        public int IdProveedor { get; set; }

        [Required]
        [Column("nombre_empresa")]
        public string NombreEmpresa { get; set; }

        [Column("alias")]
        public string Alias { get; set; }

        [Required]
        [Column("telefono")]
        public string Telefono { get; set; }

        [Column("insumo_principal")]
        public string InsumoPrincipal { get; set; }

        [Column("direccion")]
        public string Direccion { get; set; }

        [Column("fecha_registro")]
        public DateTime? FechaRegistro { get; set; }

    }
}
