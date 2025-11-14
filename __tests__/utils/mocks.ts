// Mock Firebase Auth
export const mockFirebaseAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn(); // unsubscribe function
  }),
  signInAnonymously: jest.fn(() => Promise.resolve({
    user: {
      uid: 'anonymous-user-id',
      isAnonymous: true,
      email: null,
    },
  })),
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: {
      uid: 'google-user-id',
      isAnonymous: false,
      email: 'test@example.com',
      displayName: 'Test User',
    },
  })),
  signOut: jest.fn(() => Promise.resolve()),
  linkWithPopup: jest.fn(() => Promise.resolve({
    user: {
      uid: 'google-user-id',
      isAnonymous: false,
      email: 'test@example.com',
    },
  })),
};

// Mock Firebase Firestore
export const mockFirestore = {
  collection: jest.fn((collectionName: string) => ({
    id: collectionName,
    add: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
    get: jest.fn(() => Promise.resolve({
      docs: [],
      empty: true,
    })),
    where: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        docs: [],
        empty: true,
      })),
    })),
  })),
  doc: jest.fn((collectionName: string, docId: string) => ({
    id: docId,
    collection: collectionName,
    get: jest.fn(() => Promise.resolve({
      exists: () => false,
      data: () => null,
      id: docId,
    })),
    update: jest.fn(() => Promise.resolve()),
  })),
  query: jest.fn((ref, ...queries) => ref),
};

// Mock Firebase functions
export const mockFirebase = {
  auth: mockFirebaseAuth,
  firestore: mockFirestore,
};

// Mock Pet data
export const mockPet = {
  id: 'pet-123',
  userId: 'user-123',
  name: 'Max',
  species: 'dog' as const,
  age: 3,
  breed: 'Golden Retriever',
  weight: 25,
  gender: 'Male' as const,
  createdAt: new Date('2024-01-01'),
};

// Mock Conversation data
export const mockConversation = {
  id: 'conv-123',
  petId: 'pet-123',
  createdAt: new Date('2024-01-01'),
  firstMessage: 'My dog is not eating',
};

// Mock Message data
export const mockMessage = {
  id: 'msg-123',
  conversationId: 'conv-123',
  role: 'user' as const,
  content: 'My dog is not eating',
  createdAt: new Date('2024-01-01'),
  feedback: null,
};

// Mock API responses
export const mockApiResponse = {
  chat: {
    message: 'Based on the symptoms you described, I recommend monitoring your pet closely...',
    contextualPills: ['Not eating', 'Lethargy'],
  },
};

// Helper to create mock user
export const createMockUser = (overrides = {}) => ({
  uid: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  isAnonymous: false,
  ...overrides,
});

// Helper to create mock anonymous user
export const createMockAnonymousUser = () => ({
  uid: 'anonymous-user-id',
  email: null,
  displayName: null,
  isAnonymous: true,
});

