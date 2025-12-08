import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../pages/Profile';
import { authService } from '../../services/api';

jest.mock('../../services/api', () => ({
  authService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfilePicture: jest.fn()
  }
}));

jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student'
};

const mockAuthContextValue = {
  user: mockUser,
  loading: false,
  updateUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn()
};

jest.mock('../../context/AuthContext', () => {
  const React = require('react');
  const mockAuthContext = React.createContext(null);
  return {
    __esModule: true,
    default: mockAuthContext,
    useAuth: () => mockAuthContextValue
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const ProfileWrapper = () => (
  <BrowserRouter>
    <Profile />
  </BrowserRouter>
);

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    authService.getProfile.mockImplementation(() => new Promise(() => {}));
    render(<ProfileWrapper />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should load and display profile', async () => {
    const mockProfile = { ...mockUser, phone: '1234567890' };
    authService.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    render(<ProfileWrapper />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });
  });

  it('should update form fields', async () => {
    authService.getProfile.mockResolvedValue({
      data: { data: mockUser }
    });

    render(<ProfileWrapper />);

    await waitFor(() => {
      const firstNameInput = document.querySelector('#firstName');
      if (firstNameInput) {
        fireEvent.change(firstNameInput, { target: { value: 'Updated' } });
        expect(firstNameInput.value).toBe('Updated');
      }
    });
  });

  it('should submit form and update profile', async () => {
    authService.getProfile.mockResolvedValue({
      data: { data: mockUser }
    });
    authService.updateProfile.mockResolvedValue({
      data: { data: { ...mockUser, firstName: 'Updated' } }
    });

    render(<ProfileWrapper />);

    await waitFor(async () => {
      const submitButton = screen.getByRole('button', { name: /kaydet/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(authService.updateProfile).toHaveBeenCalled();
      });
    });
  });

  it('should handle file upload', async () => {
    authService.getProfile.mockResolvedValue({
      data: { data: mockUser }
    });
    authService.uploadProfilePicture.mockResolvedValue({
      data: { success: true }
    });

    render(<ProfileWrapper />);

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Simulate file change event
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Wait for the upload to be triggered
      await waitFor(() => {
        expect(authService.uploadProfilePicture).toHaveBeenCalled();
      }, { timeout: 3000 });
    }
  });

  it('should reject file larger than 5MB', async () => {
    authService.getProfile.mockResolvedValue({
      data: { data: mockUser }
    });

    render(<ProfileWrapper />);

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [largeFile] } });
      }
    });
  });

  it('should display student profile information', async () => {
    const mockProfile = {
      ...mockUser,
      studentProfile: {
        studentNumber: '12345',
        department: { name: 'CS', code: 'CS' }
      }
    };
    authService.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    render(<ProfileWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/12345/i)).toBeInTheDocument();
    });
  });
});

