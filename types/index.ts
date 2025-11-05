// Type definitions for LetsVet

/**
 * Pet - Represents a pet in the system
 */
export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: 'dog' | 'cat';
  age: number;
  breed: string;
  weight: number;
  createdAt: Date;
}

/**
 * Conversation - Represents a chat conversation about a pet's health
 */
export interface Conversation {
  id: string;
  petId: string;
  createdAt: Date;
}

/**
 * Message - Represents a single message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  feedback: 'up' | 'down' | null;
  createdAt: Date;
}

/**
 * TriageSession - Legacy type for triage sessions
 * @deprecated Use Conversation and Message instead
 */
export interface TriageSession {
  id: string;
  petId: string;
  symptoms: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  timestamp: Date;
}

// ============================================================================
// Utility Types for Creating Entities
// ============================================================================

/**
 * CreatePetInput - Data needed to create a new pet
 * Omits id and createdAt as these are generated server-side
 */
export type CreatePetInput = Omit<Pet, 'id' | 'createdAt'>;

/**
 * UpdatePetInput - Data for updating a pet
 * All fields except id and userId are optional
 */
export type UpdatePetInput = Partial<Omit<Pet, 'id' | 'userId' | 'createdAt'>> & {
  id: string;
};

/**
 * CreateConversationInput - Data needed to create a new conversation
 * Omits id and createdAt as these are generated server-side
 */
export type CreateConversationInput = Omit<Conversation, 'id' | 'createdAt'>;

/**
 * CreateMessageInput - Data needed to create a new message
 * Omits id, createdAt, and feedback as these are set server-side
 */
export type CreateMessageInput = Omit<Message, 'id' | 'createdAt' | 'feedback'>;

// ============================================================================
// Firestore Document Types
// ============================================================================

/**
 * FirestoreDocument - Helper type for documents retrieved from Firestore
 * Converts Date fields to Firestore Timestamp for proper serialization
 */
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

/**
 * PetDocument - Pet as stored in Firestore
 */
export type PetDocument = Omit<Pet, 'createdAt'> & {
  createdAt: FirestoreTimestamp;
};

/**
 * ConversationDocument - Conversation as stored in Firestore
 */
export type ConversationDocument = Omit<Conversation, 'createdAt'> & {
  createdAt: FirestoreTimestamp;
};

/**
 * MessageDocument - Message as stored in Firestore
 */
export type MessageDocument = Omit<Message, 'createdAt'> & {
  createdAt: FirestoreTimestamp;
};
