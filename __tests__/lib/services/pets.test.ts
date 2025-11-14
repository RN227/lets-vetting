import { createPet, getUserPets, getPetById } from '@/lib/services/pets';
import { collection, addDoc, getDocs, getDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({
      toDate: () => new Date('2024-01-01'),
    })),
  },
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;

describe('Pets Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPet', () => {
    it('should create a pet successfully', async () => {
      const mockDocRef = { id: 'pet-123' };
      const mockPetsRef = { id: 'pets' };

      mockCollection.mockReturnValue(mockPetsRef as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const petData = {
        name: 'Max',
        species: 'dog' as const,
        age: 3,
        breed: 'Golden Retriever',
        weight: 25,
        gender: 'Male' as const,
      };

      const result = await createPet('user-123', petData);

      expect(mockCollection).toHaveBeenCalledWith(db, 'pets');
      expect(mockAddDoc).toHaveBeenCalledWith(mockPetsRef, {
        userId: 'user-123',
        ...petData,
        createdAt: expect.any(Object),
      });
      expect(result).toEqual({
        id: 'pet-123',
        userId: 'user-123',
        ...petData,
        createdAt: expect.any(Date),
      });
    });

    it('should throw error on failure', async () => {
      mockCollection.mockReturnValue({ id: 'pets' } as any);
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      const petData = {
        name: 'Max',
        species: 'dog' as const,
        age: 3,
        breed: 'Golden Retriever',
        weight: 25,
        gender: 'Male' as const,
      };

      await expect(createPet('user-123', petData)).rejects.toThrow('Failed to create pet');
    });
  });

  describe('getUserPets', () => {
    it('should fetch all pets for a user', async () => {
      const mockPetsRef = { id: 'pets' };
      const mockQueryObj = {};
      const mockDocs = [
        {
          id: 'pet-1',
          data: () => ({
            userId: 'user-123',
            name: 'Max',
            species: 'dog',
            age: 3,
            breed: 'Golden Retriever',
            weight: 25,
            gender: 'Male',
            createdAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
        {
          id: 'pet-2',
          data: () => ({
            userId: 'user-123',
            name: 'Bella',
            species: 'cat',
            age: 2,
            breed: 'Persian',
            weight: 4,
            gender: 'Female',
            createdAt: { toDate: () => new Date('2024-01-02') },
          }),
        },
      ];

      mockCollection.mockReturnValue(mockPetsRef as any);
      mockWhere.mockReturnValue(mockQueryObj as any);
      mockQuery.mockReturnValue(mockQueryObj as any);
      mockGetDocs.mockResolvedValue({
        docs: mockDocs,
      } as any);

      const result = await getUserPets('user-123');

      expect(mockCollection).toHaveBeenCalledWith(db, 'pets');
      expect(mockWhere).toHaveBeenCalledWith(mockPetsRef, 'userId', '==', 'user-123');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'pet-1',
        userId: 'user-123',
        name: 'Max',
        species: 'dog',
        age: 3,
        breed: 'Golden Retriever',
        weight: 25,
        gender: 'Male',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should return empty array when user has no pets', async () => {
      mockCollection.mockReturnValue({ id: 'pets' } as any);
      mockWhere.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const result = await getUserPets('user-123');

      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      mockCollection.mockReturnValue({ id: 'pets' } as any);
      mockWhere.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getUserPets('user-123')).rejects.toThrow('Failed to fetch pets');
    });
  });

  describe('getPetById', () => {
    it('should fetch a pet by ID', async () => {
      const mockPetRef = { id: 'pet-123' };
      const mockPetSnap = {
        exists: () => true,
        id: 'pet-123',
        data: () => ({
          userId: 'user-123',
          name: 'Max',
          species: 'dog',
          age: 3,
          breed: 'Golden Retriever',
          weight: 25,
          gender: 'Male',
          createdAt: { toDate: () => new Date('2024-01-01') },
        }),
      };

      mockDoc.mockReturnValue(mockPetRef as any);
      mockGetDoc.mockResolvedValue(mockPetSnap as any);

      const result = await getPetById('pet-123');

      expect(mockDoc).toHaveBeenCalledWith(db, 'pets', 'pet-123');
      expect(result).toEqual({
        id: 'pet-123',
        userId: 'user-123',
        name: 'Max',
        species: 'dog',
        age: 3,
        breed: 'Golden Retriever',
        weight: 25,
        gender: 'Male',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should return null when pet does not exist', async () => {
      const mockPetRef = { id: 'pet-123' };
      const mockPetSnap = {
        exists: () => false,
      };

      mockDoc.mockReturnValue(mockPetRef as any);
      mockGetDoc.mockResolvedValue(mockPetSnap as any);

      const result = await getPetById('pet-123');

      expect(result).toBeNull();
    });

    it('should throw error on failure', async () => {
      mockDoc.mockReturnValue({ id: 'pet-123' } as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(getPetById('pet-123')).rejects.toThrow('Failed to fetch pet');
    });
  });
});

