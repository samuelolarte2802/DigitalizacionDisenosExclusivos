using DigitalizacionAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DigitalizacionAPI.Repositories;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoRepository _pedidoRepository;

        public PedidosController(IPedidoRepository pedidoRepository)
        {

            _pedidoRepository = pedidoRepository;

        }

        [HttpGet]
        public async Task<IActionResult> GetPedidos()
        {
            
            var listaPedidos = await _pedidoRepository.ObtenerTodosConClientesAsync();
            return Ok(listaPedidos);

        }

        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidosPorEstado(string estado)
        {
            var pedidos = await _pedidoRepository.ObtenerPorEstadoAsync(estado);

            if (!pedidos.Any())
                return NotFound(new { mensaje = $"No hay pedidos en estado '{estado}' actualmente." });

            return Ok(pedidos);

        }

        [HttpGet("caja-semanal")]
        public async Task<ActionResult<object>> GetCajaSemanal()
        {
            
            var reporte = await _pedidoRepository.ObtenerCajaSemanalAsync();
            return Ok(reporte);

        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<Pedido>> PostPedido(Pedido pedido)
        {

            await _pedidoRepository.CrearAsync(pedido);
            return CreatedAtAction(nameof(GetPedidos), new { id = pedido.IdPedido }, pedido);

        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutPedido(int id, Pedido pedido)
        {

            if (id != pedido.IdPedido) return BadRequest();
            
            await _pedidoRepository.ActualizarAsync(pedido);
            return NoContent();

        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePedido(int id)
        {

            var pedido = await _pedidoRepository.ObtenerPorIdAsync(id);
            if(pedido == null) return NotFound();

            await _pedidoRepository.EliminarAsync(pedido);
            return NoContent();

        }
    }
}
