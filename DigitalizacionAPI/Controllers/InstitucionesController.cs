using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalizacionAPI.Controllers
{
    [Route("api/[controller]")] // Esto hace que la ruta sea /api/Instituciones
    [ApiController]
    public class InstitucionesController : ControllerBase
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_institucion")]
        public int IdInstitucion { get; set; }
        private readonly AppDbContext _context;

        public InstitucionesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Institucion>>> GetInstituciones()
        {

            var lista = await _context.Instituciones.ToListAsync();
            return Ok(lista);

        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Institucion>> PostInstitucion(Institucion institucion)
        {

            _context.Instituciones.Add(institucion);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInstituciones), new { id = institucion.IdInstitucion }, institucion);

        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PutInstitucion(int id, Institucion institucion)
        {
        
            if (id != institucion.IdInstitucion)
            {
                return BadRequest("El ID de la URL no coincide con el objeto enviado.");
            }

            _context.Entry(institucion).State = EntityState.Modified;

            try
            {

                await _context.SaveChangesAsync();

            }
            catch (DbUpdateConcurrencyException)
            {
                
                if (!_context.Instituciones.Any(e => e.IdInstitucion == id))
                {
                    return NotFound("La institución que intentas actualizar no existe.");
                }
                else
                {
                    throw;
                }
            }
            
            return NoContent();

        }
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteInstitucion(int id)
        {

            var institucion = await _context.Instituciones.FindAsync(id);
            if (institucion == null)
            {
                return NotFound("La institución que intentas borrar no existe.");
            }

            _context.Instituciones.Remove(institucion);
            await _context.SaveChangesAsync();

            return NoContent();

        }
    }
}
