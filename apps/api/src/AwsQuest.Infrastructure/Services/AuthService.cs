namespace AwsQuest.Infrastructure.Services;

using FluentValidation;
using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.Auth;
using AwsQuest.Application.Mappings;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _dbContext;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IValidator<RegisterRequestDto>? _registerValidator;
    private readonly IValidator<LoginRequestDto>? _loginValidator;

    public AuthService(
        IAppDbContext dbContext,
        IJwtService jwtService,
        IPasswordHasher passwordHasher,
        IValidator<RegisterRequestDto>? registerValidator = null,
        IValidator<LoginRequestDto>? loginValidator = null)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    public async Task<GuestSessionResponseDto> CreateGuestSessionAsync(CancellationToken cancellationToken = default)
    {
        var randomSuffix = Random.Shared.Next(1000, 9999);
        var guestUser = new User
        {
            Id = Guid.NewGuid(),
            Name = $"Invitado_{randomSuffix}",
            Email = null,
            PasswordHash = null,
            IsGuest = true,
            TotalXP = 0,
            Level = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(guestUser);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _jwtService.GenerateToken(guestUser);

        return new GuestSessionResponseDto
        {
            AccessToken = token,
            User = guestUser.ToDto()
        };
    }

    public async Task<RegisterResponseDto> RegisterAsync(
        RegisterRequestDto request, 
        Guid? guestUserId = null, 
        CancellationToken cancellationToken = default)
    {
        if (_registerValidator != null)
        {
            await _registerValidator.ValidateAndThrowAsync(request, cancellationToken);
        }

        var emailExists = await _dbContext.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (emailExists)
        {
            throw new DuplicateEmailException(request.Email);
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        User userToPersist;
        int migratedProgressCount = 0;

        if (guestUserId.HasValue)
        {
            var guestUser = await _dbContext.Users
                .Include(u => u.Progress)
                .FirstOrDefaultAsync(u => u.Id == guestUserId.Value && u.IsGuest, cancellationToken);

            if (guestUser != null)
            {
                // Promoción In-Place: Convierte el invitado existente en usuario permanente
                guestUser.Email = request.Email;
                guestUser.PasswordHash = passwordHash;
                guestUser.Name = request.Name;
                guestUser.IsGuest = false;
                guestUser.UpdatedAt = DateTime.UtcNow;

                migratedProgressCount = guestUser.Progress.Count;
                userToPersist = guestUser;
            }
            else
            {
                userToPersist = CreateNewPermanentUser(request, passwordHash);
                _dbContext.Users.Add(userToPersist);
            }
        }
        else
        {
            userToPersist = CreateNewPermanentUser(request, passwordHash);
            _dbContext.Users.Add(userToPersist);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _jwtService.GenerateToken(userToPersist);

        return new RegisterResponseDto
        {
            AccessToken = token,
            User = userToPersist.ToDto(),
            MigratedProgressCount = migratedProgressCount
        };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        if (_loginValidator != null)
        {
            await _loginValidator.ValidateAndThrowAsync(request, cancellationToken);
        }

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsGuest, cancellationToken);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new InvalidCredentialsException();
        }

        var token = _jwtService.GenerateToken(user);

        return new LoginResponseDto
        {
            AccessToken = token,
            User = user.ToDto()
        };
    }

    public async Task<UserProfileDto> GetCurrentUserProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new UserNotFoundException(userId);
        }

        var completedChallengesCount = await _dbContext.UserProgresses
            .AsNoTracking()
            .CountAsync(p => p.UserId == userId && p.Status == ProgressStatus.Completed, cancellationToken);

        return user.ToProfileDto(completedChallengesCount);
    }

    private static User CreateNewPermanentUser(RegisterRequestDto request, string passwordHash)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            IsGuest = false,
            TotalXP = 0,
            Level = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
