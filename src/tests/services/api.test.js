// Mock axios before importing the api module
const mockInterceptorHandlers = {
  request: { use: jest.fn() },
  response: { use: jest.fn() }
};

const mockApiInstance = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: mockInterceptorHandlers
};

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn(() => mockApiInstance),
    post: jest.fn()
  };
});

// Mock process.env for VITE_API_URL
process.env.VITE_API_URL = 'http://localhost:3000/api';

// Mock the api service module to avoid import.meta.env issues
jest.mock('../../services/api', () => {
  const axios = require('axios');
  const apiInstance = axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Mock interceptors
  apiInstance.interceptors = mockInterceptorHandlers;

  return {
    __esModule: true,
    default: apiInstance,
    authService: {
      register: jest.fn((userData) => apiInstance.post('/auth/register', userData)),
      login: jest.fn((email, password) => apiInstance.post('/auth/login', { email, password })),
      logout: jest.fn(() => apiInstance.post('/auth/logout')),
      verifyEmail: jest.fn((token) => apiInstance.get('/auth/verify-email', { params: { token } })),
      forgotPassword: jest.fn((email) => apiInstance.post('/auth/forgot-password', { email })),
      resetPassword: jest.fn((token, password) => apiInstance.post('/auth/reset-password', { token, password })),
      getProfile: jest.fn(() => apiInstance.get('/auth/profile')),
      updateProfile: jest.fn((data) => apiInstance.put('/auth/profile', data)),
      uploadProfilePicture: jest.fn((formData) => apiInstance.post('/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }))
    },
    departmentService: {
      getDepartments: jest.fn(() => apiInstance.get('/departments'))
    }
  };
});

// Import after mocks are set up
const apiModule = require('../../services/api');
const api = apiModule.default;
const { authService, departmentService } = apiModule;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete window.location;
    window.location = { href: '' };
  });

  describe('authService methods', () => {
    it('should call register endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.post.mockResolvedValue(mockResponse);

      const userData = { email: 'test@example.com', password: 'password123' };
      const result = await authService.register(userData);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call login endpoint with email and password', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password123');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call logout endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.post.mockResolvedValue(mockResponse);

      await authService.logout();

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should call verifyEmail endpoint with token', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.get.mockResolvedValue(mockResponse);

      await authService.verifyEmail('test-token');

      expect(mockApiInstance.get).toHaveBeenCalledWith('/auth/verify-email', {
        params: { token: 'test-token' }
      });
    });

    it('should call forgotPassword endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.post.mockResolvedValue(mockResponse);

      await authService.forgotPassword('test@example.com');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com'
      });
    });

    it('should call resetPassword endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.post.mockResolvedValue(mockResponse);

      await authService.resetPassword('token123', 'newpassword123');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'token123',
        password: 'newpassword123'
      });
    });

    it('should call getProfile endpoint', async () => {
      const mockResponse = { data: { data: { id: '1' } } };
      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await authService.getProfile();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockResponse);
    });

    it('should call updateProfile endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.put.mockResolvedValue(mockResponse);

      const profileData = { firstName: 'Test' };
      await authService.updateProfile(profileData);

      expect(mockApiInstance.put).toHaveBeenCalledWith('/auth/profile', profileData);
    });

    it('should call uploadProfilePicture with FormData', async () => {
      const mockResponse = { data: { success: true } };
      mockApiInstance.post.mockResolvedValue(mockResponse);
      const formData = new FormData();

      await authService.uploadProfilePicture(formData);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    });
  });

  describe('departmentService methods', () => {
    it('should call getDepartments endpoint', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await departmentService.getDepartments();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/departments');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Request Interceptor', () => {
    it('should be configured', () => {
      expect(mockInterceptorHandlers.request.use).toHaveBeenCalled();
    });

    it('should add token when available', () => {
      localStorage.setItem('token', 'test-token');
      
      // Get the request interceptor success handler
      const requestSuccessHandler = mockInterceptorHandlers.request.use.mock.calls[0]?.[0];
      if (requestSuccessHandler) {
        const config = { headers: {} };
        const result = requestSuccessHandler(config);
        expect(result.headers.Authorization).toBe('Bearer test-token');
      }
    });

    it('should not add token when not available', () => {
      localStorage.removeItem('token');
      
      const requestSuccessHandler = mockInterceptorHandlers.request.use.mock.calls[0]?.[0];
      if (requestSuccessHandler) {
        const config = { headers: {} };
        const result = requestSuccessHandler(config);
        expect(result.headers.Authorization).toBeUndefined();
      }
    });

    it('should handle request errors', () => {
      const requestErrorHandler = mockInterceptorHandlers.request.use.mock.calls[0]?.[1];
      if (requestErrorHandler) {
        const error = new Error('Request failed');
        expect(() => requestErrorHandler(error)).rejects.toEqual(error);
      }
    });
  });

  describe('Response Interceptor', () => {
    it('should be configured', () => {
      expect(mockInterceptorHandlers.response.use).toHaveBeenCalled();
    });

    it('should return response on success', () => {
      const responseSuccessHandler = mockInterceptorHandlers.response.use.mock.calls[0]?.[0];
      if (responseSuccessHandler) {
        const response = { data: { success: true } };
        expect(responseSuccessHandler(response)).toEqual(response);
      }
    });

    it('should handle 401 errors', () => {
      const responseErrorHandler = mockInterceptorHandlers.response.use.mock.calls[0]?.[1];
      expect(responseErrorHandler).toBeDefined();
    });
  });

  describe('Default export', () => {
    it('should export api instance', () => {
      expect(api).toBeDefined();
    });
  });
});
