using Microsoft.EntityFrameworkCore;
using DigitalizacionAPI.Data;

namespace DigitalizacionAPI.Services
{
    public class LimpiezaAuditoriaWorker : BackgroundService
    {

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<LimpiezaAuditoriaWorker> _logger;
        public LimpiezaAuditoriaWorker(IServiceScopeFactory scopeFactory, ILogger<LimpiezaAuditoriaWorker> logger)
        {

            _scopeFactory = scopeFactory;
            _logger = logger;

        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {

            _logger.LogInformation("Servicio de Limpieza Automática de Auditoría Iniciado.");
            while (!stoppingToken.IsCancellationRequested)
            {

                try
                {

                    _logger.LogInformation("Iniciando purga programada de la tabla de auditoría...");
                    using (var scope = _scopeFactory.CreateScope())
                    {

                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        await context.Database.ExecuteSqlRawAsync("CALL limpiar_auditoria_antigua(6);", stoppingToken);

                    }

                    _logger.LogInformation("Purga completada con éxito. Registros mayores a 6 meses eliminados.");

                }
                catch (Exception ex)
                {

                    _logger.LogError($"Error al ejecutar la limpieza de auditoría: {ex.Message}");

                }
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);

            }
        }
    }
}
