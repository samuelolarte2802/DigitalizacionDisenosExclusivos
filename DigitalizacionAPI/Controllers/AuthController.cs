using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalizacionAPI.Data;
using DigitalizacionAPI.DTOs;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly AppDbContext _context;
        public AuthController(AppDbContext context)
        {

            _context = context;

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest credenciales)
        {

            var usuarioDb = await _context.Usuarios
                                          .FirstOrDefaultAsync(u => u.Nombre == credenciales.Nombre);

            if (usuarioDb == null)
            {
                
                return Unauthorized(new { mensaje = "El usuario no existe en el sistema." });

            }

            bool esValida = BCrypt.Net.BCrypt.Verify(credenciales.Clave, usuarioDb.CredencialHash);

            if (!esValida)
            {

                return Unauthorized(new { mensaje = "Contraseña incorrecta." });

            }

            return Ok(new
            {

                mensaje = "¡Autenticación exitosa!",
                idUsuario = usuarioDb.IdUsuario,
                idRol = usuarioDb.IdRol,
                nombre = usuarioDb.Nombre

            });
        }
    }
}
