import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../authApi';
import { httpClient } from '../../../../shared/api/httpClient';
import { GuestSessionResponseDto, LoginResponseDto, RegisterResponseDto, UserProfileDto } from '../../types/auth.types';

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('createGuestSession debe llamar a POST /auth/guest y retornar los datos del payload', async () => {
    const mockGuestResponse: GuestSessionResponseDto = {
      accessToken: 'guest-jwt-token',
      user: {
        id: 'usr-guest-1',
        name: 'Invitado_1234',
        email: null,
        isGuest: true,
        totalXP: 0,
        level: 1
      }
    };

    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({
      data: {
        success: true,
        data: mockGuestResponse
      }
    });

    const result = await authApi.createGuestSession();

    expect(postSpy).toHaveBeenCalledWith('/auth/guest');
    expect(result).toEqual(mockGuestResponse);
  });

  it('register debe llamar a POST /auth/register incluyendo Authorization header si se provee guestToken (RN-13)', async () => {
    const mockRegisterResponse: RegisterResponseDto = {
      accessToken: 'perm-jwt-token',
      user: {
        id: 'usr-perm-1',
        name: 'Carlos',
        email: 'carlos@test.com',
        isGuest: false,
        totalXP: 250,
        level: 2
      },
      migratedProgressCount: 3
    };

    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({
      data: {
        success: true,
        data: mockRegisterResponse
      }
    });

    const registerDto = {
      name: 'Carlos',
      email: 'carlos@test.com',
      password: 'SecurePassword123!'
    };

    const result = await authApi.register(registerDto, 'previous-guest-token');

    expect(postSpy).toHaveBeenCalledWith(
      '/auth/register',
      registerDto,
      {
        headers: {
          Authorization: 'Bearer previous-guest-token'
        }
      }
    );
    expect(result).toEqual(mockRegisterResponse);
  });

  it('login debe llamar a POST /auth/login con las credenciales', async () => {
    const mockLoginResponse: LoginResponseDto = {
      accessToken: 'logged-jwt-token',
      user: {
        id: 'usr-perm-1',
        name: 'Carlos',
        email: 'carlos@test.com',
        isGuest: false,
        totalXP: 250,
        level: 2
      }
    };

    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({
      data: {
        success: true,
        data: mockLoginResponse
      }
    });

    const loginDto = {
      email: 'carlos@test.com',
      password: 'SecurePassword123!'
    };

    const result = await authApi.login(loginDto);

    expect(postSpy).toHaveBeenCalledWith('/auth/login', loginDto);
    expect(result).toEqual(mockLoginResponse);
  });

  it('getMe debe llamar a GET /auth/me y retornar el perfil', async () => {
    const mockProfile: UserProfileDto = {
      id: 'usr-perm-1',
      name: 'Carlos',
      email: 'carlos@test.com',
      isGuest: false,
      totalXP: 250,
      level: 2,
      completedChallengesCount: 3
    };

    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: mockProfile
      }
    });

    const result = await authApi.getMe();

    expect(getSpy).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockProfile);
  });
});
