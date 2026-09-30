using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using AwsQuest.Api.Extensions;
using AwsQuest.Api.Middlewares;
using AwsQuest.Application;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Soporte para Reverse Proxy (Render / Load Balancers)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Autenticación JWT y Autorización
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// CORS Policy dinámica para Desarrollo y Producción
var configuredOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?.Where(o => !string.IsNullOrWhiteSpace(o))
    .Select(o => o.Trim().TrimEnd('/'))
    .ToArray() ?? [];

var defaultLocalOrigins = new[]
{
    "http://localhost:5173",
    "https://localhost:5173",
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:80"
};

var effectiveOrigins = configuredOrigins.Length > 0 ? configuredOrigins : defaultLocalOrigins;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAppFrontend", policy =>
    {
        policy.WithOrigins(effectiveOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate Limiting para Protección contra Abuso / DoS
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        var response = new ApiErrorResponse
        {
            Error = new ApiErrorDetails
            {
                Code = "RATE_LIMIT_EXCEEDED",
                Message = "Demasiadas solicitudes. Por favor espere antes de reintentar."
            }
        };
        await context.HttpContext.Response.WriteAsync(
            System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            }), token);
    };

    options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "global_client";
        return System.Threading.RateLimiting.RateLimitPartition.GetSlidingWindowLimiter(
            clientIp,
            _ => new System.Threading.RateLimiting.SlidingWindowRateLimiterOptions
            {
                PermitLimit = 150,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            });
    });
});

// Swagger & OpenAPI
builder.Services.AddSwaggerDocumentation();

// Health Check Services
builder.Services.AddHealthCheckServices();

var app = builder.Build();

// Reverse Proxy Headers (Render TLS Termination)
app.UseForwardedHeaders();

// Global Exception Handler Middleware
app.UseMiddleware<ApiExceptionMiddleware>();

// Health Check Endpoint
app.UseHealthCheckEndpoint();

// Swagger UI Documentation (condicionado a Development o flag explícito de producción)
if (app.Environment.IsDevelopment() || app.Configuration.GetValue("SwaggerSettings:EnableInProduction", false))
{
    app.UseSwaggerDocumentation();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AwsQuest.Infrastructure.Persistence.AppDbContext>();
    var autoMigrate = app.Configuration.GetValue("DatabaseSettings:AutoMigrateOnStartup", true);
    if (autoMigrate)
    {
        await dbContext.Database.MigrateAsync();
    }

    var seeder = scope.ServiceProvider.GetRequiredService<IChallengeSeeder>();
    await seeder.SeedAsync();
}

app.UseCors("AllowAppFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
