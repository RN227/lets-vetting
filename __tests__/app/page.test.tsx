import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { useAuth } from '@/lib/auth-context';
import { getUserPets } from '@/lib/services/pets';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/auth-context');
jest.mock('@/lib/services/pets');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetUserPets = getUserPets as jest.MockedFunction<typeof getUserPets>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Home Page', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
  });

  it('should render loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });

    render(<Home />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render landing page for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });

    render(<Home />);
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
    expect(screen.getByText(/I Already Have an Account/i)).toBeInTheDocument();
  });

  it('should show login form when "I Already Have an Account" is clicked', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });

    render(<Home />);
    
    const alreadyHaveAccountButton = screen.getByText(/I Already Have an Account/i);
    await user.click(alreadyHaveAccountButton);

    await waitFor(() => {
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
      expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    });
  });

  it('should navigate to onboarding when "Get Started" is clicked', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });

    render(<Home />);
    
    const getStartedButton = screen.getByText(/Get Started/i);
    await user.click(getStartedButton);

    expect(mockPush).toHaveBeenCalledWith('/onboarding/why');
  });

  it('should redirect authenticated users with pets to chat', async () => {
    const mockUser = {
      uid: 'user-123',
      isAnonymous: false,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });

    mockGetUserPets.mockResolvedValue([
      {
        id: 'pet-123',
        userId: 'user-123',
        name: 'Max',
        species: 'dog',
        age: 3,
        breed: 'Golden Retriever',
        weight: 25,
        gender: 'Male',
        createdAt: new Date(),
      },
    ]);

    render(<Home />);

    await waitFor(() => {
      expect(mockGetUserPets).toHaveBeenCalledWith('user-123');
      expect(mockPush).toHaveBeenCalledWith('/chat?petId=pet-123');
    });
  });

  it('should redirect authenticated users without pets to onboarding', async () => {
    const mockUser = {
      uid: 'user-123',
      isAnonymous: false,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });

    mockGetUserPets.mockResolvedValue([]);

    render(<Home />);

    await waitFor(() => {
      expect(mockGetUserPets).toHaveBeenCalledWith('user-123');
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });
});

