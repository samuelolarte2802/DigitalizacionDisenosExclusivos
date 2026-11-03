using System.Net;
using System.Text.Json;

namespace DigitalizacionAPI.Middlewares
{
    public class ExceptionMiddleware
    {

        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {

            _next = next;
            _logger = logger;

        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {

                await _next(context);

            }
            catch (Exception ex)
            {

                _logger.LogError(ex,"Excepcion no controlada captura por el Global Handler.");
                await HandleExceptionAsync(context, ex);

            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var problemDetails = new
            {

                status = context.Response.StatusCode,
                title = "Error Interno del sistema",
                detail = "Ha ocurrido un problema procesando tu solicitud. El equipo técnico ha sido notificado.",
                developerMessage = exception.Message

            };

            var jsonResponse = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions 
            { 

                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 

            });

            return context.Response.WriteAsync(jsonResponse);
        }
    }
}
