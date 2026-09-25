
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Infrastructure.Persistence;

namespace AwsQuest.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddScoped<IChallengeContentReader, AwsQuest.Infrastructure.Persistence.Seeding.JsonChallengeContentReader>();
        services.AddScoped<IChallengeSeeder, AwsQuest.Infrastructure.Persistence.Seeding.ChallengeSeeder>();

        // Autenticación, Seguridad y Contexto de Usuario
        services.Configure<AwsQuest.Infrastructure.Authentication.JwtSettings>(
            configuration.GetSection(AwsQuest.Infrastructure.Authentication.JwtSettings.SectionName));
        services.AddHttpContextAccessor();
        services.AddSingleton<IPasswordHasher, AwsQuest.Infrastructure.Authentication.BCryptPasswordHasher>();
        services.AddSingleton<IJwtService, AwsQuest.Infrastructure.Authentication.JwtService>();
        services.AddScoped<IAuthService, AwsQuest.Infrastructure.Services.AuthService>();
        services.AddScoped<ICurrentUserService, AwsQuest.Infrastructure.Services.CurrentUserService>();

        // Catálogo y Desafíos
        services.AddScoped<ICatalogService, AwsQuest.Infrastructure.Services.CatalogService>();
        services.AddScoped<IChallengeService, AwsQuest.Infrastructure.Services.ChallengeService>();

        // Pistas y Evaluación
        services.AddSingleton<AwsQuest.Domain.Engine.IEvaluationEngine, AwsQuest.Domain.Engine.EvaluationEngine>();
        services.AddScoped<IHintService, AwsQuest.Infrastructure.Services.HintService>();
        services.AddScoped<IEvaluationService, AwsQuest.Infrastructure.Services.EvaluationService>();

        // Servicios Maestros y Configuración del Sistema
        services.AddScoped<IMasterServicesService, AwsQuest.Infrastructure.Services.MasterServicesService>();
        services.AddScoped<ISystemConfigService, AwsQuest.Infrastructure.Services.SystemConfigService>();

        return services;
    }
}
