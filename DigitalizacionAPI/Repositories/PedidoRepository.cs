using Microsoft.EntityFrameworkCore;
using DigitalizacionAPI.Data;
using DigitalizacionAPI.Models;

namespace DigitalizacionAPI.Repositories
{
    public class PedidoRepository : IPedidoRepository
    {
        private readonly AppDbContext _context;
        public PedidoRepository(AppDbContext context)
        {

            _context = context;

        }
        public async Task<IEnumerable<object>> ObtenerTodosConClientesAsync()
        {

            return await (from p in _context.Pedidos
                           join c in _context.Clientes on p.IdCliente equals c.IdCliente
                           select new 
                           { 
                               idPedido = p.IdPedido,
                               idCliente = p.IdCliente,
                               nombre = c.NombreCompleto,
                               fechaPedido = p.FechaPedido,
                               totalPagar = p.TotalPagar,
                               abono = p.Abono,
                               idUsuario = p.IdUsuario,
                               estado = p.Estado,
                               estadoPago = p.EstadoPago
                           }).ToListAsync();

        }

        public async Task<IEnumerable<Pedido>> ObtenerPorEstadoAsync(string estado)
        {

            return await _context.Pedidos
                                 .Where(p => p.Estado == estado)
                                 .OrderBy(p => p.FechaPedido)
                                 .ToListAsync();

        }
        public async Task<object> ObtenerCajaSemanalAsync()
        {

            var fechaLimite = DateTime.UtcNow.AddDays(-7);
            var totalRecaudado = await _context.Pedidos
                .Where(p => p.FechaPedido >= fechaLimite)
                .SumAsync(p => p.Abono);
            var totalPedidos = await _context.Pedidos
                .CountAsync(p => p.FechaPedido >= fechaLimite);
            return new
            {

                mensaje = "Cierre de caja de los últimos 7 días",
                pedidosNuevos = totalPedidos,
                totalAbonos = totalRecaudado

            };
        }
        public async Task<Pedido> ObtenerPorIdAsync(int id)
        {

            return await _context.Pedidos.FindAsync(id);

        }
        public async Task CrearAsync(Pedido pedido)
        {

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

        }

        public async Task ActualizarAsync(Pedido pedido)
        {

            _context.Entry(pedido).State = EntityState.Modified;
            await _context.SaveChangesAsync();

        }

        public async Task EliminarAsync(Pedido pedido)
        {

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();

        }
    }
}
