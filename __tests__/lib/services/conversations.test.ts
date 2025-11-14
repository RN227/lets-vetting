import {
  createConversation,
  addMessage,
  getConversationMessages,
  updateMessageFeedback,
  getConversationsForPet,
} from '@/lib/services/conversations';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  updateDoc: jest.fn(),
  limit: jest.fn(),
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
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;

describe('Conversations Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    it('should create a conversation successfully', async () => {
      const mockDocRef = { id: 'conv-123' };
      const mockConversationsRef = { id: 'conversations' };

      mockCollection.mockReturnValue(mockConversationsRef as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await createConversation('pet-123');

      expect(mockCollection).toHaveBeenCalledWith(db, 'conversations');
      expect(mockAddDoc).toHaveBeenCalledWith(mockConversationsRef, {
        petId: 'pet-123',
        createdAt: expect.any(Object),
      });
      expect(result).toBe('conv-123');
    });

    it('should throw error on failure', async () => {
      mockCollection.mockReturnValue({ id: 'conversations' } as any);
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(createConversation('pet-123')).rejects.toThrow('Failed to create conversation');
    });
  });

  describe('addMessage', () => {
    it('should add a message successfully', async () => {
      const mockDocRef = { id: 'msg-123' };
      const mockMessagesRef = { id: 'messages' };

      mockCollection.mockReturnValue(mockMessagesRef as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await addMessage('conv-123', 'user', 'Hello');

      expect(mockCollection).toHaveBeenCalledWith(db, 'conversations', 'conv-123', 'messages');
      expect(mockAddDoc).toHaveBeenCalledWith(mockMessagesRef, {
        role: 'user',
        content: 'Hello',
        feedback: null,
        createdAt: expect.any(Object),
      });
      expect(result).toBe('msg-123');
    });

    it('should throw error on failure', async () => {
      mockCollection.mockReturnValue({ id: 'messages' } as any);
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(addMessage('conv-123', 'user', 'Hello')).rejects.toThrow('Failed to add message');
    });
  });

  describe('getConversationMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessagesRef = { id: 'messages' };
      const mockQueryObj = {};
      const mockDocs = [
        {
          id: 'msg-1',
          data: () => ({
            role: 'user',
            content: 'Hello',
            feedback: null,
            createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
          }),
        },
        {
          id: 'msg-2',
          data: () => ({
            role: 'assistant',
            content: 'Hi there!',
            feedback: null,
            createdAt: { toDate: () => new Date('2024-01-01T10:01:00') },
          }),
        },
      ];

      mockCollection.mockReturnValue(mockMessagesRef as any);
      mockOrderBy.mockReturnValue(mockQueryObj as any);
      mockQuery.mockReturnValue(mockQueryObj as any);
      mockGetDocs.mockResolvedValue({
        docs: mockDocs,
      } as any);

      const result = await getConversationMessages('conv-123');

      expect(mockCollection).toHaveBeenCalledWith(db, 'conversations', 'conv-123', 'messages');
      expect(mockOrderBy).toHaveBeenCalledWith(mockMessagesRef, 'createdAt', 'asc');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Hello',
        feedback: null,
        createdAt: new Date('2024-01-01T10:00:00'),
      });
    });

    it('should return empty array when no messages', async () => {
      mockCollection.mockReturnValue({ id: 'messages' } as any);
      mockOrderBy.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const result = await getConversationMessages('conv-123');

      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      mockCollection.mockReturnValue({ id: 'messages' } as any);
      mockOrderBy.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getConversationMessages('conv-123')).rejects.toThrow('Failed to fetch messages');
    });
  });

  describe('updateMessageFeedback', () => {
    it('should update message feedback successfully', async () => {
      const mockMessageRef = { id: 'msg-123' };

      mockDoc.mockReturnValue(mockMessageRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await updateMessageFeedback('conv-123', 'msg-123', 'up');

      expect(mockDoc).toHaveBeenCalledWith(db, 'conversations', 'conv-123', 'messages', 'msg-123');
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockMessageRef, {
        feedback: 'up',
      });
      expect(result).toBe(true);
    });

    it('should throw error on failure', async () => {
      mockDoc.mockReturnValue({ id: 'msg-123' } as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(updateMessageFeedback('conv-123', 'msg-123', 'up')).rejects.toThrow(
        'Failed to update message feedback'
      );
    });
  });

  describe('getConversationsForPet', () => {
    it('should fetch conversations with first message', async () => {
      const mockConversationsRef = { id: 'conversations' };
      const mockMessagesRef = { id: 'messages' };
      const mockQueryObj = {};
      const mockConversations = [
        {
          id: 'conv-1',
          data: () => ({
            petId: 'pet-123',
            createdAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
      ];
      const mockMessages = [
        {
          id: 'msg-1',
          data: () => ({
            role: 'user',
            content: 'First message',
            createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
          }),
        },
      ];

      mockCollection
        .mockReturnValueOnce(mockConversationsRef as any) // For conversations
        .mockReturnValueOnce(mockMessagesRef as any); // For messages
      mockWhere.mockReturnValue(mockQueryObj as any);
      mockOrderBy.mockReturnValue(mockQueryObj as any);
      mockQuery.mockReturnValue(mockQueryObj as any);
      mockLimit.mockReturnValue(mockQueryObj as any);
      mockGetDocs
        .mockResolvedValueOnce({
          docs: mockConversations,
        } as any)
        .mockResolvedValueOnce({
          docs: mockMessages,
          empty: false,
        } as any);

      const result = await getConversationsForPet('pet-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'conv-1',
        petId: 'pet-123',
        createdAt: new Date('2024-01-01'),
        firstMessage: 'First message',
      });
    });

    it('should handle conversations without messages', async () => {
      const mockConversationsRef = { id: 'conversations' };
      const mockMessagesRef = { id: 'messages' };
      const mockQueryObj = {};
      const mockConversations = [
        {
          id: 'conv-1',
          data: () => ({
            petId: 'pet-123',
            createdAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
      ];

      mockCollection
        .mockReturnValueOnce(mockConversationsRef as any)
        .mockReturnValueOnce(mockMessagesRef as any);
      mockWhere.mockReturnValue(mockQueryObj as any);
      mockOrderBy.mockReturnValue(mockQueryObj as any);
      mockQuery.mockReturnValue(mockQueryObj as any);
      mockLimit.mockReturnValue(mockQueryObj as any);
      mockGetDocs
        .mockResolvedValueOnce({
          docs: mockConversations,
        } as any)
        .mockResolvedValueOnce({
          docs: [],
          empty: true,
        } as any);

      const result = await getConversationsForPet('pet-123');

      expect(result).toHaveLength(1);
      expect(result[0].firstMessage).toBeUndefined();
    });

    it('should throw error on failure', async () => {
      mockCollection.mockReturnValue({ id: 'conversations' } as any);
      mockWhere.mockReturnValue({} as any);
      mockOrderBy.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getConversationsForPet('pet-123')).rejects.toThrow('Failed to fetch conversations');
    });
  });
});

