import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmail from '../../pages/VerifyEmail';
import { authService } from '../../services/api';

jest.mock('../../services/api', () => ({
  authService: {
    verifyEmail: jest.fn()
  }
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    new URLSearchParams('?token=test-token')
  ]
}));

const VerifyEmailWrapper = () => (
  <BrowserRouter>
    <VerifyEmail />
  </BrowserRouter>
);

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render verifying state initially', () => {
    authService.verifyEmail.mockImplementation(() => new Promise(() => {}));
    render(<VerifyEmailWrapper />);
    expect(screen.getByText(/doğrulanıyor/i)).toBeInTheDocument();
  });

  it('should verify email successfully', async () => {
    authService.verifyEmail.mockResolvedValue({ data: { success: true } });
    
    render(<VerifyEmailWrapper />);
    
    await waitFor(() => {
      expect(authService.verifyEmail).toHaveBeenCalledWith('test-token');
    });
    
    await waitFor(() => {
      expect(screen.getByText(/başarıyla doğrulandı/i)).toBeInTheDocument();
    });
  });

  it('should handle verification error', async () => {
    authService.verifyEmail.mockRejectedValue({
      response: { data: { error: 'Invalid token' } }
    });
    
    render(<VerifyEmailWrapper />);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid token|doğrulama başarısız/i)).toBeInTheDocument();
    });
  });

  it('should show error when token is missing', () => {
    jest.resetModules();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useSearchParams: () => [new URLSearchParams('')]
    }));
  });

  it('should have link to login after success', async () => {
    authService.verifyEmail.mockResolvedValue({ data: { success: true } });
    
    render(<VerifyEmailWrapper />);
    
    await waitFor(() => {
      const loginButton = screen.getByRole('link', { name: /giriş yap/i });
      expect(loginButton).toHaveAttribute('href', '/login');
    });
  });
});

