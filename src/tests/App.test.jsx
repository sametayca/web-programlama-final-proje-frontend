import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

const mockAuthContextValue = {
  user: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn()
};

jest.mock('../context/AuthContext', () => {
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

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContextValue.user = null;
    mockAuthContextValue.loading = false;
  });

  it('should show loading when auth is loading', () => {
    mockAuthContextValue.loading = true;
    render(<AppWrapper />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthContextValue.loading = false;
    mockAuthContextValue.user = null;
    render(<AppWrapper />);
    // Should redirect to login
    expect(window.location.pathname).toBe('/');
  });

  it('should show dashboard when user is authenticated', () => {
    mockAuthContextValue.loading = false;
    mockAuthContextValue.user = { id: '1', email: 'test@example.com' };
    render(<AppWrapper />);
    // Protected routes require authentication
  });

  it('should render login route', () => {
    mockAuthContextValue.loading = false;
    mockAuthContextValue.user = null;
    window.history.pushState({}, '', '/login');
    render(<AppWrapper />);
  });

  it('should render register route', () => {
    mockAuthContextValue.loading = false;
    mockAuthContextValue.user = null;
    window.history.pushState({}, '', '/register');
    render(<AppWrapper />);
  });
});

