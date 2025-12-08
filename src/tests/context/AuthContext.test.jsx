import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { React } from 'react';

jest.mock('../../services/api', () => ({
  authService: {
    getProfile: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn()
  }
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
    
    console.error = originalError;
  });

  it('should initialize with null user when no token in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBe(null);
  });

  it('should load user from localStorage if token exists', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    authService.getProfile.mockResolvedValue({
      data: { data: mockUser }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authService.getProfile).toHaveBeenCalled();
  });

  it('should clear user when getProfile fails', async () => {
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('user', JSON.stringify({ id: '1' }));
    
    authService.getProfile.mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(localStorage.getItem('token')).toBe(null);
  });

  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockResponse = {
      data: {
        data: {
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token'
        }
      }
    };

    authService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login('test@example.com', 'password');
      expect(response.success).toBe(true);
    });

    expect(localStorage.getItem('token')).toBe('access-token');
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle login failure', async () => {
    authService.login.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login('test@example.com', 'wrong');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });
  });

  it('should register successfully', async () => {
    authService.register.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.register({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(response.success).toBe(true);
    });
  });

  it('should handle register failure', async () => {
    authService.register.mockRejectedValue({
      response: { data: { error: 'Email already exists' } }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.register({
        email: 'existing@example.com',
        password: 'password123'
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already exists');
    });
  });

  it('should logout successfully', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1' }));

    authService.logout.mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(localStorage.getItem('token')).toBe(null);
    expect(result.current.user).toBe(null);
  });

  it('should update user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const updatedUser = { id: '1', email: 'updated@example.com' };

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(updatedUser);
  });
});






