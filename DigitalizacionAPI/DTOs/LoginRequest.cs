using System.ComponentModel.DataAnnotations;

namespace DigitalizacionAPI.DTOs
{
    public class LoginRequest
    {

        [Required]
        public string Nombre { get; set; }

        [Required]
        public string Clave { get; set; }

    }
}
