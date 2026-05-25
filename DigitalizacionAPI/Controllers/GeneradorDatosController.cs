using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DigitalizacionAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class GeneradorDatosController : ControllerBase
    {

        private readonly AppDbContext _context;
        public GeneradorDatosController(AppDbContext context)
        {

            _context = context;

        }
        [HttpPost("generar-masivo")]
        public async Task<IActionResult> GenerarDatosMasivos()
        {

            var random = new Random();
            var rol = _context.Roles.FirstOrDefault(r => r.NombreRol == "Admin Sistema");
            if (rol == null)
            {
                rol = new Rol { NombreRol = "Admin Sistema" };
                _context.Roles.Add(rol);
                await _context.SaveChangesAsync();
            }

            var usuario = _context.Usuarios.FirstOrDefault(u => u.Nombre == "Sistema Auto");
            if (usuario == null)
            {
                usuario = new Usuario { IdRol = rol.IdRol, Nombre = "Sistema Auto", CredencialHash = "hash_generado" };
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();
            }

            var institucion = _context.Instituciones.FirstOrDefault(i => i.Nombre == "Colegio Test");
            if (institucion == null)
            {
                institucion = new Institucion { Nombre = "Colegio Test", Descripcion = "Generada por sistema" };
                _context.Instituciones.Add(institucion);
                await _context.SaveChangesAsync();
            }

            await _context.SaveChangesAsync();

            var nombres = new[] { "Carlos", "Maria", "Samuel", "Andrea", "Jorge", "Lucia", "Daniel", "Sofia", "Valentina", "Mateo" };
            var apellidos = new[] { "Olarte", "Tenjo", "Gomez", "Perez", "Rodriguez", "Lopez", "Martinez", "Silva" };

            var clientes = new List<Cliente>();
            for (int i = 0; i < 50; i++)
            {
                clientes.Add(new Cliente
                {

                    NombreCompleto = $"{nombres[random.Next(nombres.Length)]} {apellidos[random.Next(apellidos.Length)]}",
                    AliasCliente = $"Cliente {i + 1}",
                    Celular = $"300{random.Next(1000000, 9999999)}",
                    FechaRegistro = DateTime.UtcNow.AddDays(-random.Next(1, 300)) 

                });
            }
            _context.Clientes.AddRange(clientes);
            await _context.SaveChangesAsync();

            var estados = new[] { "En Corte", "En Costura", "Terminado", "Entregado" }; 
            var estadosPago = new[] { "Abonado", "Pagado", "Pendiente" };

            for (int i = 0; i < 1000; i++)
            {
                
                var start = new DateTime(2025, 1, 1, 8, 0, 0, DateTimeKind.Utc);
                int range = (new DateTime(2026, 12, 31) - start).Days;
                var fechaAleatoria = start.AddDays(random.Next(range));
                var estadoAleatorio = estados[random.Next(estados.Length)];
                var precioCalculado = random.Next(80000, 250000);
                var pedido = new Pedido
                {

                    IdCliente = clientes[random.Next(clientes.Count)].IdCliente,
                    IdUsuario = usuario.IdUsuario,
                    FechaPedido = fechaAleatoria,
                    TotalPagar = precioCalculado,
                    Abono = random.Next(40000, 80000),
                    Estado = estadoAleatorio,
                    EstadoPago = estadosPago[random.Next(estadosPago.Length)]

                };
                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();

                var medidas = JsonSerializer.SerializeToDocument(new { cintura = random.Next(60, 90), largo_pierna = random.Next(80, 110), ancho_espalda = random.Next(35, 50) });
                var piezas = JsonSerializer.SerializeToDocument(new { pantalon = true, camisa = true, chaqueta = random.Next(0, 2) == 1 });
                var detalle = new DetallePedido
                {

                    IdPedido = pedido.IdPedido,
                    FechaPedido = fechaAleatoria,
                    EstadoPedido = estadoAleatorio,
                    IdInstitucion = institucion.IdInstitucion,
                    TipoPrenda = "Uniforme Diario",
                    TipoTela = "Antifluido",
                    TallaGeneral = random.Next(6, 18).ToString(),
                    MedidasEspecificas = medidas,
                    NombreBeneficiario = "Estudiante Genérico",
                    PiezasIncluidas = piezas,
                    TallaCobro = random.Next(8, 16).ToString(),
                    PrecioCongelado = precioCalculado

                };
                _context.DetallesPedidos.Add(detalle);
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Misión cumplida: 50 clientes y 1000 pedidos/detalles creados exitosamente en las particiones 2025 y 2026." });
        }
    }
}
