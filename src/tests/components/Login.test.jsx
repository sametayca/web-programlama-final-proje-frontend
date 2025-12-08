import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { createContext } from 'react';
import Login from '../../pages/Login';

// Mock the auth context
const mockLogin = jest.fn();
const mockAuthContextValue = {
  user: null,
  login: mockLogin,
  logout: jest.fn(),
  register: jest.fn(),
  loading: false
};

// Mock AuthContext module
jest.mock('../../context/AuthContext', () => {
  const React = require('react');
  const mockAuthContext = React.createContext(null);
  return {
    __esModule: true,
    default: mockAuthContext,
    useAuth: () => mockAuthContextValue,
    AuthProvider: ({ children }) => {
      return React.createElement(mockAuthContext.Provider, { value: mockAuthContextValue }, children);
    }
  };
});

// Create AuthContext for wrapper
const AuthContext = createContext(null);

// Wrapper component with providers
const LoginWrapper = () => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContextValue}>
      <Login />
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginWrapper />);
    
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('should update email input value', () => {
    render(<LoginWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update password input value', () => {
    render(<LoginWrapper />);
    
    const passwordInput = screen.getByLabelText(/şifre/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should toggle password visibility', () => {
    render(<LoginWrapper />);
    
    const passwordInput = screen.getByLabelText(/şifre/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should call login function on form submit', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    render(<LoginWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error message when login fails', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Geçersiz kullanıcı adı veya şifre' });
    
    render(<LoginWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/geçersiz/i)).toBeInTheDocument();
    });
  });

  it('should display loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
    
    render(<LoginWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled during loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should have link to register page', () => {
    render(<LoginWrapper />);
    
    const registerLink = screen.getByRole('link', { name: /kayıt ol/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.getAttribute('href')).toBe('/register');
  });

  it('should have link to forgot password page', () => {
    render(<LoginWrapper />);
    
    const forgotPasswordLink = screen.getByRole('link', { name: /şifremi unuttum/i });
    expect(forgotPasswordLink).toBeInTheDocument();
  });
});

