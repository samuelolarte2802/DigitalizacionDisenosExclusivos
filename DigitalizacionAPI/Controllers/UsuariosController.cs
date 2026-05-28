using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {

        private readonly AppDbContext _context;
        public UsuariosController(AppDbContext context)
        {

            _context = context;

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
            
            var usuarioDb = await _context.Usuarios.FirstOrDefaultAsync(u =>
                u.Correo == credenciales.Correo &&
                u.CredencialHash == credenciales.Password);

            if (usuarioDb == null)
            {
            
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos" });

            }

            return Ok(new
            {

                id = usuarioDb.IdUsuario,
                usuario = usuarioDb.Nombre

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
