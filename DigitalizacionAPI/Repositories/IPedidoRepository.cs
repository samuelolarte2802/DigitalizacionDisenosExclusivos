using DigitalizacionAPI.Models;

namespace DigitalizacionAPI.Repositories
{
    public interface IPedidoRepository
    {

        Task<IEnumerable<object>> ObtenerTodosConClientesAsync();
        Task<IEnumerable<Pedido>> ObtenerPorEstadoAsync(string estado);
        Task<object>ObtenerCajaSemanalAsync();
        Task<Pedido> ObtenerPorIdAsync(int id);
        Task CrearAsync(Pedido pedido);
        Task ActualizarAsync(Pedido pedido);
        Task EliminarAsync(Pedido pedido);

    }
}
