namespace AwsQuest.Api.Extensions;

using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "AWS Architecture Quest API",
                Version = "v1",
                Description = "API REST modular para la plataforma gamificada de aprendizaje de arquitecturas en la nube AWS Architecture Quest (.NET 10).",
                Contact = new OpenApiContact
                {
                    Name = "Equipo AWS Quest",
                    Email = "contacto@awsquest.dev"
                },
                License = new OpenApiLicense
                {
                    Name = "MIT License"
                }
            });

            // 1. Configuración de Esquema de Seguridad Bearer JWT
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Ingrese el token JWT con el prefijo Bearer. Ejemplo: 'Bearer {token}'",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT"
            };

            options.AddSecurityDefinition("Bearer", securityScheme);

            options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference("Bearer"),
                    new List<string>()
                }
            });

            // 2. Inclusión de Comentarios XML para documentación en Swagger UI
            var xmlApiFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlApiPath = Path.Combine(AppContext.BaseDirectory, xmlApiFile);
            if (File.Exists(xmlApiPath))
            {
                options.IncludeXmlComments(xmlApiPath);
            }

            var xmlApplicationFile = "AwsQuest.Application.xml";
            var xmlApplicationPath = Path.Combine(AppContext.BaseDirectory, xmlApplicationFile);
            if (File.Exists(xmlApplicationPath))
            {
                options.IncludeXmlComments(xmlApplicationPath);
            }
        });

        return services;
    }

    public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "AWS Architecture Quest API v1");
            options.RoutePrefix = "swagger";
            options.DocumentTitle = "AWS Architecture Quest - API Docs";
            options.DisplayRequestDuration();
            options.EnablePersistAuthorization();
        });

        return app;
    }
}
