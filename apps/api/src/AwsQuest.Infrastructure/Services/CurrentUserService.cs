namespace AwsQuest.Infrastructure.Services;

using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using AwsQuest.Application.Common.Interfaces;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var sub = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public bool IsGuest
    {
        get
        {
            var claim = User?.FindFirst("isGuest")?.Value;
            return bool.TryParse(claim, out var isGuest) && isGuest;
        }
    }

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);
}
