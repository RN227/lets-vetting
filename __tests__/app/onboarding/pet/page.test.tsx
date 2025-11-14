import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPetPage from '@/app/onboarding/pet/page';
import { useAuth } from '@/lib/auth-context';
import { createPet } from '@/lib/services/pets';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/auth-context');
jest.mock('@/lib/services/pets');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockCreatePet = createPet as jest.MockedFunction<typeof createPet>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('AddPetPage', () => {
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

  const mockUser = {
    uid: 'user-123',
    isAnonymous: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAuth.mockReturnValue({
      user: mockUser as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeAnonymousAccount: jest.fn(),
      signOut: jest.fn(),
      isAnonymous: jest.fn(() => false),
    });
  });

  it('should render form fields', () => {
    render(<AddPetPage />);
    
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Species/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age \(years\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Breed/i)).toBeInTheDocument();
  });

  it('should show error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<AddPetPage />);
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter your pet's name/i)).toBeInTheDocument();
    });
  });

  it('should validate all required fields', async () => {
    const user = userEvent.setup();
    render(<AddPetPage />);
    
    // Fill only name
    await user.type(screen.getByLabelText(/Name/i), 'Max');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select your pet's species/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockCreatedPet = {
      id: 'pet-123',
      userId: 'user-123',
      name: 'Max',
      species: 'dog' as const,
      age: 3,
      breed: 'Golden Retriever',
      weight: 25,
      gender: 'Male' as const,
      createdAt: new Date(),
    };

    mockCreatePet.mockResolvedValue(mockCreatedPet);

    render(<AddPetPage />);
    
    // Fill form
    await user.type(screen.getByLabelText(/Name/i), 'Max');
    await user.click(screen.getByLabelText(/Dog/i));
    await user.type(screen.getByLabelText(/Age \(years\)/i), '3');
    await user.type(screen.getByLabelText(/Weight \(kg\)/i), '25');
    await user.click(screen.getByLabelText(/Male/i));
    await user.type(screen.getByLabelText(/Breed/i), 'Golden Retriever');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePet).toHaveBeenCalledWith('user-123', {
        name: 'Max',
        species: 'dog',
        age: 3,
        breed: 'Golden Retriever',
        weight: 25,
        gender: 'Male',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Pet saved successfully/i)).toBeInTheDocument();
    });

    // Should redirect after success
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/chat?petId=pet-123');
    }, { timeout: 2000 });
  });

  it('should show breed suggestions when typing', async () => {
    const user = userEvent.setup();
    render(<AddPetPage />);
    
    // Select species first
    await user.click(screen.getByLabelText(/Dog/i));
    
    // Type in breed field
    const breedInput = screen.getByLabelText(/Breed/i);
    await user.type(breedInput, 'Gold');

    await waitFor(() => {
      expect(screen.getByText(/Golden Retriever/i)).toBeInTheDocument();
    });
  });

  it('should filter breeds based on species', async () => {
    const user = userEvent.setup();
    render(<AddPetPage />);
    
    // Select cat
    await user.click(screen.getByLabelText(/Cat/i));
    
    // Type in breed field
    const breedInput = screen.getByLabelText(/Breed/i);
    await user.type(breedInput, 'Pers');

    await waitFor(() => {
      expect(screen.getByText(/Persian/i)).toBeInTheDocument();
      // Should not show dog breeds
      expect(screen.queryByText(/Golden Retriever/i)).not.toBeInTheDocument();
    });
  });

  it('should clear breed when species changes', async () => {
    const user = userEvent.setup();
    render(<AddPetPage />);
    
    // Select dog and enter breed
    await user.click(screen.getByLabelText(/Dog/i));
    const breedInput = screen.getByLabelText(/Breed/i);
    await user.type(breedInput, 'Golden Retriever');
    
    // Change to cat
    await user.click(screen.getByLabelText(/Cat/i));
    
    // Breed should be cleared
    expect(breedInput).toHaveValue('');
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    const mockCreatedPet = {
      id: 'pet-123',
      userId: 'user-123',
      name: 'Max',
      species: 'dog' as const,
      age: 3,
      breed: 'Golden Retriever',
      weight: 25,
      gender: 'Male' as const,
      createdAt: new Date(),
    };

    // Delay the promise resolution
    mockCreatePet.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockCreatedPet), 100))
    );

    render(<AddPetPage />);
    
    // Fill form
    await user.type(screen.getByLabelText(/Name/i), 'Max');
    await user.click(screen.getByLabelText(/Dog/i));
    await user.type(screen.getByLabelText(/Age \(years\)/i), '3');
    await user.type(screen.getByLabelText(/Weight \(kg\)/i), '25');
    await user.click(screen.getByLabelText(/Male/i));
    await user.type(screen.getByLabelText(/Breed/i), 'Golden Retriever');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup();
    mockCreatePet.mockRejectedValue(new Error('Failed to create pet'));

    render(<AddPetPage />);
    
    // Fill form
    await user.type(screen.getByLabelText(/Name/i), 'Max');
    await user.click(screen.getByLabelText(/Dog/i));
    await user.type(screen.getByLabelText(/Age \(years\)/i), '3');
    await user.type(screen.getByLabelText(/Weight \(kg\)/i), '25');
    await user.click(screen.getByLabelText(/Male/i));
    await user.type(screen.getByLabelText(/Breed/i), 'Golden Retriever');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to save pet information/i)).toBeInTheDocument();
    });
  });
});

