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
    public class PedidosController : ControllerBase
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_pedido")]
        public int IdPedido { get; set; }
        private readonly AppDbContext _context;

        public PedidosController(AppDbContext context)
        {

            _context = context;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
        {

            return await _context.Pedidos.ToListAsync();

        }

        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidosPorEstado(string estado)
        {
            var pedidos = await _context.Pedidos
                                        .Where(p => p.Estado == estado)
                                        .OrderBy(p => p.FechaPedido)
                                        .ToListAsync();

            if (!pedidos.Any())
                return NotFound(new { mensaje = $"No hay pedidos en estado '{estado}' actualmente." });

            return Ok(pedidos);
        }

        [HttpGet("caja-semanal")]
        public async Task<ActionResult<object>> GetCajaSemanal()
        {
            
            var fechaLimite = DateTime.UtcNow.AddDays(-7);
            var totalRecaudado = await _context.Pedidos
                                               .Where(p => p.FechaPedido >= fechaLimite)
                                               .SumAsync(p => p.Abono);
            var totalPedidos = await _context.Pedidos
                                             .CountAsync(p => p.FechaPedido >= fechaLimite);
            return Ok(new
            {

                mensaje = "Cierre de caja de los últimos 7 días",
                pedidosNuevos = totalPedidos,
                totalAbonos = totalRecaudado

            });
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<Pedido>> PostPedido(Pedido pedido)
        {

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPedidos), new { id = pedido.IdPedido }, pedido);

        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutPedido(int id, Pedido pedido)
        {

            if (id != pedido.IdPedido) return BadRequest();

            _context.Entry(pedido).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();

        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePedido(int id)
        {

            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return NotFound();

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return NoContent();

        }
    }
}
