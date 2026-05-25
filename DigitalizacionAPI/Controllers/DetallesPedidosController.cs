using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class DetallesPedidosController : ControllerBase
    {

        private readonly AppDbContext _context;
        public DetallesPedidosController(AppDbContext context)
        {

            _context = context;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetallePedido>>> GetDetallesPedidos()
        {

            return await _context.DetallesPedidos.ToListAsync();

        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<DetallePedido>> PostDetallePedido(DetallePedido detallePedido)
        {

            detallePedido.IdDetalle = 0;
            _context.DetallesPedidos.Add(detallePedido);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDetallesPedidos), new { id = detallePedido.IdDetalle }, detallePedido);

        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutDetallePedido(int id, DetallePedido detallePedido)
        {

            if (id != detallePedido.IdDetalle) return BadRequest();

            _context.Entry(detallePedido).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();

        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteDetallePedido(int id)
        {

            var detallePedido = await _context.DetallesPedidos.FindAsync(id);
            if (detallePedido == null) return NotFound();

            _context.DetallesPedidos.Remove(detallePedido);
            await _context.SaveChangesAsync();
            return NoContent();

        }
    }
}
