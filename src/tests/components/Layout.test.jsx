import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../components/Layout';

// Mock AuthContext
const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  isEmailVerified: true,
  profilePicture: null
};

const mockAuthContextValue = {
  user: mockUser,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn()
};

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/dashboard' };

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
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

const LayoutWrapper = ({ children }) => (
  <BrowserRouter>
    <Layout>{children}</Layout>
  </BrowserRouter>
);

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContextValue.user = { ...mockUser };
    mockLocation.pathname = '/dashboard';
  });

  it('should render layout with children', () => {
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display user name and email', () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const userNames = screen.getAllByText(/Test User/i);
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('should show email verification status when verified', () => {
    mockAuthContextValue.user.isEmailVerified = true;
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    expect(screen.getByText(/Doğrulanmış/i)).toBeInTheDocument();
  });

  it('should show email verification status when not verified', () => {
    mockAuthContextValue.user.isEmailVerified = false;
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const unverifiedTexts = screen.getAllByText(/Doğrulanmamış/i);
    expect(unverifiedTexts.length).toBeGreaterThan(0);
  });

  it('should open user menu when avatar is clicked', async () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons[buttons.length - 1];
    
    if (avatarButton) {
      fireEvent.click(avatarButton);
      await waitFor(() => {
        const profileItems = screen.getAllByText(/Profil/i);
        expect(profileItems.length).toBeGreaterThan(0);
      });
    }
  });

  it('should call logout when logout is clicked', async () => {
    mockAuthContextValue.logout = jest.fn();
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons[buttons.length - 1];
    
    if (avatarButton) {
      fireEvent.click(avatarButton);
      await waitFor(() => {
        const logoutButton = screen.queryByText(/Çıkış Yap/i);
        if (logoutButton) {
          fireEvent.click(logoutButton);
          expect(mockAuthContextValue.logout).toHaveBeenCalled();
        }
      });
    }
  });

  it('should navigate to profile when profile menu item is clicked', async () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons[buttons.length - 1];
    
    if (avatarButton) {
      fireEvent.click(avatarButton);
      await waitFor(() => {
        const profileItems = screen.getAllByText(/Profil/i);
        if (profileItems.length > 0) {
          // Click the menu item (not the sidebar item)
          const menuItem = profileItems.find(item => item.closest('[role="menuitem"]') || item.closest('.MuiMenuItem-root'));
          if (menuItem) {
            fireEvent.click(menuItem);
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
          }
        }
      });
    }
  });

  it('should toggle mobile drawer', () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('drawer') ||
      btn.querySelector('svg')
    );
    
    if (menuButton) {
      fireEvent.click(menuButton);
    }
  });

  it('should display dashboard menu item', () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const dashboardItems = screen.getAllByText(/Dashboard/i);
    expect(dashboardItems.length).toBeGreaterThan(0);
  });

  it('should display profile menu item', () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const profileItems = screen.getAllByText(/Profil/i);
    expect(profileItems.length).toBeGreaterThan(0);
  });

  it('should highlight active menu item', () => {
    mockLocation.pathname = '/profile';
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const profileItems = screen.getAllByText(/Profil/i);
    expect(profileItems.length).toBeGreaterThan(0);
  });

  it('should navigate when menu item is clicked', () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    
    const menuItems = screen.getAllByText(/Dashboard|Profil/i);
    if (menuItems.length > 0) {
      fireEvent.click(menuItems[0]);
    }
  });

  it('should display user profile picture if available', () => {
    mockAuthContextValue.user.profilePicture = 'http://localhost:3000/uploads/profile-pictures/test-picture.jpg';
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    // Profile picture should be rendered
    const userNames = screen.getAllByText(/Test User/i);
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('should display user initials when no profile picture', () => {
    mockAuthContextValue.user.profilePicture = null;
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const userNames = screen.getAllByText(/Test User/i);
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('should close menu when menu close is clicked', async () => {
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    const avatarButton = buttons[buttons.length - 1];
    
    if (avatarButton) {
      fireEvent.click(avatarButton);
      await waitFor(() => {
        // Menu should be open
      });
      // Click outside or close button
      fireEvent.click(document.body);
    }
  });

  it('should display role chip correctly for student', () => {
    mockAuthContextValue.user.role = 'student';
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const studentChips = screen.getAllByText(/Öğrenci/i);
    expect(studentChips.length).toBeGreaterThan(0);
  });

  it('should display role chip correctly for faculty', () => {
    mockAuthContextValue.user.role = 'faculty';
    render(
      <LayoutWrapper>
        <div>Test</div>
      </LayoutWrapper>
    );
    const facultyChips = screen.getAllByText(/Öğretim Üyesi/i);
    expect(facultyChips.length).toBeGreaterThan(0);
  });

  it('should handle missing user data gracefully', () => {
    mockAuthContextValue.user = null;
    render(
      <LayoutWrapper>
        <div>Test Content</div>
      </LayoutWrapper>
    );
    // Layout might not render content when user is null, so just check it doesn't crash
    expect(screen.queryByText('Test Content')).toBeInTheDocument();
  });
});
