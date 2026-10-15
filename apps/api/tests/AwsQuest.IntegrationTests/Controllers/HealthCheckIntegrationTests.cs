namespace AwsQuest.IntegrationTests.Controllers;

using System.Data.Common;
using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.IntegrationTests.Infrastructure;
using Xunit;

public class HealthCheckIntegrationTests : IntegrationTestBase
{
    public HealthCheckIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task GetHealth_WhenDatabaseIsRunning_Returns200WithHealthyStatus()
    {
        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.TryGetProperty("checks", out var checks).Should().BeTrue();
        checks.GetArrayLength().Should().BeGreaterThan(0);

        var postgresCheck = checks.EnumerateArray().FirstOrDefault(c => c.GetProperty("component").GetString() == "postgresql");
        postgresCheck.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        postgresCheck.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetHealthReady_WhenDatabaseIsRunning_Returns200WithPostgresStatus()
    {
        // Act
        var response = await Client.GetAsync("/health/ready");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.TryGetProperty("checks", out var checks).Should().BeTrue();
        checks.GetArrayLength().Should().BeGreaterThan(0);

        var postgresCheck = checks.EnumerateArray().FirstOrDefault(c => c.GetProperty("component").GetString() == "postgresql");
        postgresCheck.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        postgresCheck.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetHealthLive_Returns200WithHealthyStatus_WithoutDatabaseCheck()
    {
        // Act
        var response = await Client.GetAsync("/health/live");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.TryGetProperty("checks", out var checks).Should().BeTrue();

        // Debe incluir únicamente el chequeo live y NO el chequeo de postgresql
        var liveCheck = checks.EnumerateArray().FirstOrDefault(c => c.GetProperty("component").GetString() == "live");
        liveCheck.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        liveCheck.GetProperty("status").GetString().Should().Be("Healthy");

        var postgresCheck = checks.EnumerateArray().FirstOrDefault(c => c.GetProperty("component").GetString() == "postgresql");
        postgresCheck.ValueKind.Should().Be(JsonValueKind.Undefined);
    }

    [Fact]
    public async Task GetHealthLive_ExecutesZeroSqlCommands_WhileHealthReadyExecutesDatabaseQuery()
    {
        // Arrange
        var interceptor = new QueryCountingInterceptor();
        using var factoryWithInterceptor = Fixture.Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseNpgsql(Fixture.ConnectionString);
                    options.AddInterceptors(interceptor);
                });
            });
        });

        var client = factoryWithInterceptor.CreateClient();

        // Act 1: Invocación de /health/live
        interceptor.Reset();
        var liveResponse = await client.GetAsync("/health/live");

        // Assert 1: /health/live responde 200 y ejecuta CERO comandos SQL
        liveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        interceptor.ExecutedCommandsCount.Should().Be(0, "porque /health/live es una sonda en memoria que no debe tocar la BD");

        // Act 2: Invocación de /health/ready
        interceptor.Reset();
        var readyResponse = await client.GetAsync("/health/ready");

        // Assert 2: /health/ready sí ejecuta consultas en PostgreSQL (SELECT 1)
        readyResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        interceptor.ExecutedCommandsCount.Should().BeGreaterThan(0, "porque /health/ready valida la conectividad con la base de datos");
    }

    [Fact]
    public async Task GetHealthLive_WhenDatabaseIsUnreachable_StillReturns200Healthy_WhileReadyFails()
    {
        // Arrange: Factory con cadena de conexión inválida/inaccesible
        using var disconnectedFactory = Fixture.Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseNpgsql("Host=127.0.0.1;Port=59999;Database=unreachable_db;Username=dummy;Password=dummy;Timeout=1;CommandTimeout=1;");
                });
            });
        });

        var client = disconnectedFactory.CreateClient();

        // Act & Assert 1: /health/live no depende de la BD, por lo que responde 200 OK inmediatamente
        var liveResponse = await client.GetAsync("/health/live");
        liveResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var liveContent = await liveResponse.Content.ReadAsStringAsync();
        using var liveDoc = JsonDocument.Parse(liveContent);
        liveDoc.RootElement.GetProperty("status").GetString().Should().Be("Healthy");

        // Act & Assert 2: /health/ready intenta conectar con la BD y debe fallar (503 Service Unavailable)
        var readyResponse = await client.GetAsync("/health/ready");
        readyResponse.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);

        var readyContent = await readyResponse.Content.ReadAsStringAsync();
        using var readyDoc = JsonDocument.Parse(readyContent);
        readyDoc.RootElement.GetProperty("status").GetString().Should().Be("Unhealthy");
    }

    private sealed class QueryCountingInterceptor : DbCommandInterceptor
    {
        private int _executedCommandsCount;

        public int ExecutedCommandsCount => _executedCommandsCount;

        public void Reset() => Interlocked.Exchange(ref _executedCommandsCount, 0);

        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
        {
            Interlocked.Increment(ref _executedCommandsCount);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
        {
            Interlocked.Increment(ref _executedCommandsCount);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<object> ScalarExecuting(
            DbCommand command, CommandEventData eventData, InterceptionResult<object> result)
        {
            Interlocked.Increment(ref _executedCommandsCount);
            return base.ScalarExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(
            DbCommand command, CommandEventData eventData, InterceptionResult<object> result, CancellationToken cancellationToken = default)
        {
            Interlocked.Increment(ref _executedCommandsCount);
            return base.ScalarExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<int> NonQueryExecuting(
            DbCommand command, CommandEventData eventData, InterceptionResult<int> result)
        {
            Interlocked.Increment(ref _executedCommandsCount);
            return base.NonQueryExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
            DbCommand command, CommandEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            Interlocked.Increment(ref _executedCommandsCount);
            return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
        }
    }
}
