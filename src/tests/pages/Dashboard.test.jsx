import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { authService } from '../../services/api';

jest.mock('../../services/api', () => ({
  authService: {
    getProfile: jest.fn()
  }
}));

jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  isEmailVerified: true
};

const mockAuthContextValue = {
  user: mockUser,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn()
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

const DashboardWrapper = () => (
  <BrowserRouter>
    <Dashboard />
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    authService.getProfile.mockImplementation(() => new Promise(() => {}));
    render(<DashboardWrapper />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should load and display profile', async () => {
    const mockProfile = {
      ...mockUser,
      studentProfile: {
        studentNumber: '12345',
        department: { name: 'Computer Science', code: 'CS' }
      }
    };
    authService.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    render(<DashboardWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/Hoş Geldiniz, Test/i)).toBeInTheDocument();
    });
  });

  it('should display email verification status', async () => {
    const mockProfile = { ...mockUser, isEmailVerified: false };
    authService.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    render(<DashboardWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/Beklemede/i)).toBeInTheDocument();
    });
  });

  it('should display student profile information', async () => {
    const mockProfile = {
      ...mockUser,
      studentProfile: {
        studentNumber: '12345',
        department: { name: 'Computer Science' }
      }
    };
    authService.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    render(<DashboardWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/12345/i)).toBeInTheDocument();
    });
  });

  it('should display faculty profile information', async () => {
    const mockProfile = {
      ...mockUser,
      role: 'faculty',
      facultyProfile: {
        employeeNumber: 'EMP123',
        department: { name: 'Engineering' }
      }
    };
    authService.getProfile.mockResolvedValue({
      data: { data: mockProfile }
    });

    render(<DashboardWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/EMP123/i)).toBeInTheDocument();
    });
  });

  it('should handle profile load error', async () => {
    authService.getProfile.mockRejectedValue(new Error('Failed to load'));
    
    render(<DashboardWrapper />);

    await waitFor(() => {
      expect(authService.getProfile).toHaveBeenCalled();
    });
  });
});






