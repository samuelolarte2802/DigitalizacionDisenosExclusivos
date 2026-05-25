using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {

        private readonly AppDbContext _context;
        public RolesController(AppDbContext context)
        {

            _context = context;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rol>>> GetRoles()
        {

            return await _context.Roles.ToListAsync();

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Rol>> GetRol(int id)
        {

            var rol = await _context.Roles.FindAsync(id);
            if (rol == null) return NotFound();
            return rol;

        }

        [HttpPost]
        public async Task<ActionResult<Rol>> PostRol(Rol rol)
        {

            _context.Roles.Add(rol);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(PostRol), new { id = rol.IdRol }, rol);

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRol(int id, Rol rol)
        {

            if (id != rol.IdRol) return BadRequest();
            _context.Entry(rol).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {

            var rol = await _context.Roles.FindAsync(id);
            if (rol == null) return NotFound();
            _context.Roles.Remove(rol);
            await _context.SaveChangesAsync();
            return NoContent();

        }
    }
}
