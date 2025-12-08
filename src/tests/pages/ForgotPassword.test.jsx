import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import { authService } from '../../services/api';

jest.mock('../../services/api', () => ({
  authService: {
    forgotPassword: jest.fn()
  }
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const ForgotPasswordWrapper = () => (
  <BrowserRouter>
    <ForgotPassword />
  </BrowserRouter>
);

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render forgot password form', () => {
    render(<ForgotPasswordWrapper />);
    expect(screen.getByText(/şifremi unuttum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
  });

  it('should update email input', () => {
    render(<ForgotPasswordWrapper />);
    const emailInput = screen.getByLabelText(/e-posta/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should submit form successfully', async () => {
    authService.forgotPassword.mockResolvedValue({ data: { success: true } });
    
    render(<ForgotPasswordWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const submitButton = screen.getByRole('button', { name: /gönder/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    await waitFor(() => {
      expect(screen.getByText(/gönderildi/i)).toBeInTheDocument();
    });
  });

  it('should handle error on submit', async () => {
    authService.forgotPassword.mockRejectedValue({
      response: { data: { error: 'User not found' } }
    });
    
    render(<ForgotPasswordWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const submitButton = screen.getByRole('button', { name: /gönder/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalled();
    });
  });

  it('should have link to login page', () => {
    render(<ForgotPasswordWrapper />);
    const loginLink = screen.getByText(/giriş sayfasına dön/i);
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should disable button when loading', async () => {
    authService.forgotPassword.mockImplementation(() => new Promise(() => {}));
    
    render(<ForgotPasswordWrapper />);
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const submitButton = screen.getByRole('button', { name: /gönder/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});






