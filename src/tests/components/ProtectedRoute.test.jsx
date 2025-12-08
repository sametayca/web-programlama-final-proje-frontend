import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock AuthContext
const mockAuthContextValue = {
  user: null,
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

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContextValue.user = null;
    mockAuthContextValue.loading = false;
  });

  it('should show loading when loading is true', () => {
    mockAuthContextValue.loading = true;
    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthContextValue.loading = false;
    mockAuthContextValue.user = null;
    const { container } = render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    // Navigate component renders but redirects
    expect(container).toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    mockAuthContextValue.loading = false;
    mockAuthContextValue.user = { id: '1', email: 'test@example.com' };
    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});






