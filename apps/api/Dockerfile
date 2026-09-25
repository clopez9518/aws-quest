# Stage 1: Build y Publish con .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos .csproj para restaurar dependencias y aprovechar el caché de capas
COPY apps/api/src/AwsQuest.Domain/AwsQuest.Domain.csproj apps/api/src/AwsQuest.Domain/
COPY apps/api/src/AwsQuest.Application/AwsQuest.Application.csproj apps/api/src/AwsQuest.Application/
COPY apps/api/src/AwsQuest.Infrastructure/AwsQuest.Infrastructure.csproj apps/api/src/AwsQuest.Infrastructure/
COPY apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj apps/api/src/AwsQuest.Api/

# Restaurar paquetes NuGet
RUN dotnet restore apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj

# Copiar el código fuente completo del backend
COPY apps/api/src/ apps/api/src/

# Compilar y publicar artefactos en modo Release
RUN dotnet publish apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# Stage 2: Runtime de Producción ASP.NET Core .NET 10
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Instalar curl para healthchecks
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copiar binarios compilados
COPY --from=build /app/publish .

# Copiar el catálogo declarativo oficial de contenidos (Desafíos, Servicios y Configuración)
COPY content/ /app/content/

# Variables de entorno por defecto en contenedor
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ContentSettings__ChallengesPath=/app/content/challenges
ENV ContentSettings__ServicesPath=/app/content/services
ENV ContentSettings__SystemConfigPath=/app/content/system-config.json

# Ejecutar como usuario no privilegiado 'app'
USER $APP_UID

# Exponer puerto HTTP del backend
EXPOSE 8080

# Healthcheck interno del contenedor API
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:8080/health || exit 1

# Punto de entrada
ENTRYPOINT ["dotnet", "AwsQuest.Api.dll"]
