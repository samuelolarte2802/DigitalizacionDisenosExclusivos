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
    public class ClientesController : ControllerBase
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_cliente")]
        public int IdCliente { get; set; }
        private readonly AppDbContext _context;
        public ClientesController(AppDbContext context)
        {

            _context = context;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {

            return await _context.Clientes.ToListAsync();

        }

        [HttpGet("{id}/historial-medidas")]
        public async Task<ActionResult<object>> GetHistorialMedidas(int id)
        {

            var historial = await (from p in _context.Pedidos
                                   join dp in _context.DetallesPedidos
                                   on p.IdPedido equals dp.IdPedido
                                   where p.IdCliente == id
                                   orderby p.FechaPedido descending
                                   select new
                                   {

                                       p.FechaPedido,
                                       dp.TipoPrenda,
                                       dp.TallaGeneral,
                                       dp.MedidasEspecificas

                                   }).ToListAsync();

            if (!historial.Any())
                return NotFound(new { mensaje = "Este cliente es nuevo o no tiene medidas registradas." });

            return Ok(historial);

        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<Cliente>> PostCliente(Cliente cliente)
        {

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetClientes), new { id = cliente.IdCliente }, cliente);

        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutCliente(int id, Cliente cliente)
        {

            if (id != cliente.IdCliente) return BadRequest();

            _context.Entry(cliente).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();

        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCliente(int id)
        {

            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null) return NotFound();

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();
            return NoContent();

        }
    }
}
