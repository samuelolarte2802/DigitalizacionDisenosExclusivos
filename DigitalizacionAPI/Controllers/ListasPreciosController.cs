using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ListasPreciosController : ControllerBase
    {

        private readonly AppDbContext _context;
        public ListasPreciosController(AppDbContext context)
        {

            _context = context;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListaPrecio>>> GetListasPrecios()
        {

            return await _context.ListasPrecios.ToListAsync();

        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ListaPrecio>> GetListaPrecio(int id)
        {

            var listaPrecio = await _context.ListasPrecios.FindAsync(id);

            if (listaPrecio == null)
            {

                return NotFound();

            }

            return listaPrecio;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<ListaPrecio>> PostListaPrecio(ListaPrecio listaPrecio)
        {

            listaPrecio.IdPrecio = 0;

            _context.ListasPrecios.Add(listaPrecio);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetListaPrecio), new { id = listaPrecio.IdPrecio }, listaPrecio);

        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutListaPrecio(int id, ListaPrecio listaPrecio)
        {

            if (id != listaPrecio.IdPrecio)
            {

                return BadRequest();

            }

            _context.Entry(listaPrecio).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();

        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteListaPrecio(int id)
        {

            var listaPrecio = await _context.ListasPrecios.FindAsync(id);
            if (listaPrecio == null)
            {

                return NotFound();

            }

            _context.ListasPrecios.Remove(listaPrecio);
            await _context.SaveChangesAsync();

            return NoContent();

        }
    }
}
