namespace AwsQuest.IntegrationTests.Infrastructure;

using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class TestDatabaseFixture : IAsyncLifetime
{
    public string ConnectionString { get; }
    public CustomWebApplicationFactory Factory { get; private set; } = null!;

    public TestDatabaseFixture()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        ConnectionString = config.GetConnectionString("TestConnection")
            ?? config.GetConnectionString("DefaultConnection")
            ?? "Host=127.0.0.1;Port=5437;Database=awsquest_db;Username=postgres;Password=postgres;Include Error Detail=true";
    }

    private static readonly SemaphoreSlim _initLock = new(1, 1);
    private static bool _initialized;

    public async Task InitializeAsync()
    {
        Factory = new CustomWebApplicationFactory(ConnectionString);

        await _initLock.WaitAsync();
        try
        {
            if (!_initialized)
            {
                using var scope = Factory.Services.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await context.Database.MigrateAsync();

                var seeder = scope.ServiceProvider.GetRequiredService<IChallengeSeeder>();
                await seeder.SeedAsync();

                _initialized = true;
            }
        }
        finally
        {
            _initLock.Release();
        }
    }

    public async Task ResetUserDataAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Limpiar datos transitorios conservando catálogo maestro y desafíos
        await context.Database.ExecuteSqlRawAsync(
            "TRUNCATE TABLE challenge_attempts, user_progress, users CASCADE;");

        // Asegurar configuración del sistema por defecto en OpenAccess
        var systemConfig = await context.SystemConfigs.FirstOrDefaultAsync();
        if (systemConfig != null)
        {
            systemConfig.AccessMode = Domain.Enums.AccessMode.OpenAccess;
            await context.SaveChangesAsync();
        }
    }

    public Task DisposeAsync()
    {
        Factory.Dispose();
        return Task.CompletedTask;
    }
}
