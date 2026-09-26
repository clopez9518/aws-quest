namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

/// <summary>
/// Representa un término, concepto, servicio AWS o componente de red en el diccionario arquitectónico.
/// </summary>
public class DictionaryTerm
{
    /// <summary>
    /// Identificador canónico y legible en URL (ej. "amazon-ec2", "escalabilidad-horizontal", "subnet-publica").
    /// Clave primaria.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Título formal del término (ej. "Amazon EC2", "Escalabilidad Horizontal").
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Categoría general del término:
    /// "service" | "concept" | "infrastructure" | "well-architected"
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Código del servicio asociado si corresponde (ej. "AWS_EC2", "AWS_S3", "VPC_SUBNET").
    /// Opcional para conceptos teóricos abstractos.
    /// </summary>
    public string? ServiceCode { get; set; }

    /// <summary>
    /// Pilar del AWS Well-Architected Framework al que pertenece o apoya principalmente.
    /// </summary>
    public WellArchitectedPillar? Pillar { get; set; }

    /// <summary>
    /// Definición concisa (1-2 oraciones) optimizada para el buscador Spotlight / Command Palette.
    /// </summary>
    public string ShortDefinition { get; set; } = string.Empty;

    /// <summary>
    /// Explicación pedagógica y técnica profunda (Markdown soportado).
    /// </summary>
    public string WhatIs { get; set; } = string.Empty;

    /// <summary>
    /// Lista de escenarios y casos de uso recomendados en arquitecturas reales.
    /// </summary>
    public List<string> WhenToUse { get; set; } = [];

    /// <summary>
    /// Análisis de compensaciones de diseño (Pros y Contras / Consideraciones de costo, latencia y complejidad).
    /// </summary>
    public DictionaryTradeOffs TradeOffs { get; set; } = new();

    /// <summary>
    /// Slugs de términos relacionados para la construcción del Grafo de Conocimiento (ej. ["auto-scaling-group", "application-load-balancer"]).
    /// </summary>
    public List<string> RelatedTermSlugs { get; set; } = [];

    /// <summary>
    /// IDs de los desafíos del juego donde este término es aplicado o evaluado directamente.
    /// </summary>
    public List<string> AssociatedChallengeIds { get; set; } = [];

    /// <summary>
    /// Orden de visualización o prioridad opcional.
    /// </summary>
    public int DisplayOrder { get; set; } = 0;

    /// <summary>
    /// Marca temporal de creación/actualización UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Objeto de valor que encapsula los pros y contras arquitectónicos de un término.
/// </summary>
public class DictionaryTradeOffs
{
    public string Pros { get; set; } = string.Empty;
    public string Cons { get; set; } = string.Empty;
}
