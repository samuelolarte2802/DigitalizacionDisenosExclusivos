using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DigitalizacionAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedoresController : ControllerBase
    {

        private readonly AppDbContext _context;
        public ProveedoresController(AppDbContext context)
        {

            _context = context;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Proveedor>>> GetProveedores()
        {

            return await _context.Proveedores.ToListAsync();

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Proveedor>> GetProveedor(int id)
        {

            var proveedor = await _context.Proveedores.FindAsync(id);
            if (proveedor == null) return NotFound();
            return proveedor;

        }

        [HttpPost]
        public async Task<ActionResult<Proveedor>> PostProveedor(Proveedor proveedor)
        {

            proveedor.IdProveedor = 0; // Seguridad para el SERIAL
            _context.Proveedores.Add(proveedor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProveedor), new { id = proveedor.IdProveedor }, proveedor);

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProveedor(int id, Proveedor proveedor)
        {

            if (id != proveedor.IdProveedor) return BadRequest();
            _context.Entry(proveedor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProveedor(int id)
        {

            var proveedor = await _context.Proveedores.FindAsync(id);
            if (proveedor == null) return NotFound();
            _context.Proveedores.Remove(proveedor);
            await _context.SaveChangesAsync();
            return NoContent();

        }
    }
}
