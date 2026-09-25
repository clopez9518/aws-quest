using Microsoft.EntityFrameworkCore;
using AwsQuest.Api.Extensions;
using AwsQuest.Api.Middlewares;
using AwsQuest.Application;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

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

// CORS Policy
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "https://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:80"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger & OpenAPI
builder.Services.AddSwaggerDocumentation();

// Health Check Services
builder.Services.AddHealthCheckServices();

var app = builder.Build();

// Global Exception Handler Middleware
app.UseMiddleware<ApiExceptionMiddleware>();

// Health Check Endpoint
app.UseHealthCheckEndpoint();

// Swagger UI Documentation
app.UseSwaggerDocumentation();

// Configure the HTTP request pipeline.
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AwsQuest.Infrastructure.Persistence.AppDbContext>();
    await dbContext.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<IChallengeSeeder>();
    await seeder.SeedAsync();
}

app.UseCors("AllowLocalFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
