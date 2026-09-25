namespace AwsQuest.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; init; } = true;
    public T Data { get; init; } = default!;
    public ApiMetaDto? Meta { get; init; }

    public static ApiResponse<T> Ok(T data, ApiMetaDto? meta = null) => new()
    {
        Success = true,
        Data = data,
        Meta = meta
    };
}

public class ApiMetaDto
{
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public PaginationMetadataDto? Pagination { get; init; }
}

public class PaginationMetadataDto
{
    public int Total { get; init; }
    public int Page { get; init; }
    public int Limit { get; init; }
    public int TotalPages => Limit > 0 ? (int)Math.Ceiling((double)Total / Limit) : 0;
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
