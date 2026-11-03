using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {

        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public UsuariosController(AppDbContext context, IConfiguration config)
        {

            _context = context;
            _config = config;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {

            return await _context.Usuarios.ToListAsync();

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {

            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            return usuario;

        }

        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {

            usuario.IdUsuario = 0;
            string salt = BCrypt.Net.BCrypt.GenerateSalt(12);
            usuario.CredencialHash = BCrypt.Net.BCrypt.HashPassword(usuario.CredencialHash, salt);
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, usuario);

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO credenciales)
        {
            
            var usuarioDb = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo == credenciales.Correo);

            if (usuarioDb == null)
            {
            
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });

            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(credenciales.Password, usuarioDb.CredencialHash);

            if  (!isPasswordValid)
            {

                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });

            }

            var claims = new[]
            {

                new Claim(ClaimTypes.NameIdentifier, usuarioDb.IdUsuario.ToString()),
                new Claim(ClaimTypes.Email, usuarioDb.Correo),
                new Claim(ClaimTypes.Name, usuarioDb.Nombre),
                new Claim(ClaimTypes.Role, usuarioDb.Rol?.NombreRol ?? "Sin Rol")

            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var tokenDescriptor = new SecurityTokenDescriptor
            {

                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]

            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);

            return Ok(new
            {

                token = jwtToken,
                usuario = new
                {
                    
                    nombre = usuarioDb.Nombre,
                    rol = usuarioDb.Rol?.NombreRol,

                }
            });
        }

        [HttpGet("crear-admin")]
        public async Task<IActionResult> CrearAdmin()
        {

            var rolAdmin = await _context.Roles.FirstOrDefaultAsync();
            if (rolAdmin == null)
            {

                rolAdmin = new Rol { NombreRol = "Administrador" };
                _context.Roles.Add(rolAdmin);
                await _context.SaveChangesAsync();

            }

            var usuario = new Usuario
            {
                Nombre = "Admin",
                Correo = "admin@taller.com",
                CredencialHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                IdRol = rolAdmin.IdRol

            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new
            {

                Mensaje = "!Usuario listo para usarse en React!",
                Correo = "admin@taller.com",
                Password = "admin123"

            });

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {

            if (id != usuario.IdUsuario) return BadRequest();
            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {

            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return NoContent();

        }
        public class LoginDTO
        {
            public string Correo { get; set; }
            public string Password { get; set; }

        }
    }   
}
