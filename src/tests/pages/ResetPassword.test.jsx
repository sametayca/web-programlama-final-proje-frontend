import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../../pages/ResetPassword';
import { authService } from '../../services/api';

jest.mock('../../services/api', () => ({
  authService: {
    resetPassword: jest.fn()
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
  useNavigate: () => jest.fn(),
  useSearchParams: () => [
    new URLSearchParams('?token=test-token')
  ]
}));

const ResetPasswordWrapper = () => (
  <BrowserRouter>
    <ResetPassword />
  </BrowserRouter>
);

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render reset password form', () => {
    render(<ResetPasswordWrapper />);
    expect(screen.getByText(/şifre sıfırla/i)).toBeInTheDocument();
    expect(document.querySelector('#password')).toBeInTheDocument();
    expect(document.querySelector('#confirmPassword')).toBeInTheDocument();
  });

  it('should update password inputs', () => {
    render(<ResetPasswordWrapper />);
    const passwordInput = document.querySelector('#password');
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    expect(passwordInput.value).toBe('newpassword');
  });

  it('should show error when passwords do not match', async () => {
    render(<ResetPasswordWrapper />);
    
    const passwordInput = document.querySelector('#password');
    const confirmInput = document.querySelector('#confirmPassword');
    const submitButton = screen.getByRole('button', { name: /şifreyi sıfırla/i });
    
    fireEvent.change(passwordInput, { target: { value: 'password1' } });
    fireEvent.change(confirmInput, { target: { value: 'password2' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/eşleşmiyor/i)).toBeInTheDocument();
    });
  });

  it('should show error when password is too short', async () => {
    render(<ResetPasswordWrapper />);
    
    const passwordInput = document.querySelector('#password');
    const confirmInput = document.querySelector('#confirmPassword');
    const submitButton = screen.getByRole('button', { name: /şifreyi sıfırla/i });
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/6 karakter/i)).toBeInTheDocument();
    });
  });

  it('should submit form successfully', async () => {
    authService.resetPassword.mockResolvedValue({ data: { success: true } });
    
    render(<ResetPasswordWrapper />);
    
    const passwordInput = document.querySelector('#password');
    const confirmInput = document.querySelector('#confirmPassword');
    const submitButton = screen.getByRole('button', { name: /şifreyi sıfırla/i });
    
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('test-token', 'newpassword123');
    });
  });

  it('should handle error on submit', async () => {
    authService.resetPassword.mockRejectedValue({
      response: { data: { error: 'Invalid token' } }
    });
    
    render(<ResetPasswordWrapper />);
    
    const passwordInput = document.querySelector('#password');
    const confirmInput = document.querySelector('#confirmPassword');
    const submitButton = screen.getByRole('button', { name: /şifreyi sıfırla/i });
    
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
    });
  });

  it('should show error when token is missing', () => {
    jest.resetModules();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => jest.fn(),
      useSearchParams: () => [new URLSearchParams('')]
    }));
  });
});

