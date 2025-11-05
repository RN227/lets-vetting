/**
 * Firebase Usage Examples
 *
 * This file contains examples of how to use Firebase client and admin SDK
 * in your LetsVet application with the defined TypeScript types.
 * Remove this file in production.
 */

// ============================================================================
// CLIENT-SIDE USAGE (Components, Client Components, Browser)
// ============================================================================

import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import type {
  Pet,
  Conversation,
  Message,
  CreatePetInput,
  UpdatePetInput,
  CreateConversationInput,
  CreateMessageInput
} from '@/types';

// Example: Sign up a new user
export async function signUpUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Example: Sign in an existing user
export async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Example: Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Example: Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// Pet Operations
// ============================================================================

// Example: Create a new pet
export async function createPet(petInput: CreatePetInput): Promise<string> {
  try {
    const petsRef = collection(db, 'pets');
    const docRef = await addDoc(petsRef, {
      ...petInput,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
}

// Example: Get a single pet by ID
export async function getPet(petId: string): Promise<Pet | null> {
  try {
    const petRef = doc(db, 'pets', petId);
    const petSnap = await getDoc(petRef);

    if (!petSnap.exists()) {
      return null;
    }

    return {
      id: petSnap.id,
      ...petSnap.data(),
      createdAt: petSnap.data().createdAt.toDate(),
    } as Pet;
  } catch (error) {
    console.error('Error getting pet:', error);
    throw error;
  }
}

// Example: Get all pets for a user
export async function getUserPets(userId: string): Promise<Pet[]> {
  try {
    const petsRef = collection(db, 'pets');
    const q = query(petsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    } as Pet));
  } catch (error) {
    console.error('Error getting user pets:', error);
    throw error;
  }
}

// Example: Update a pet
export async function updatePet(updateData: UpdatePetInput): Promise<void> {
  try {
    const petRef = doc(db, 'pets', updateData.id);
    const { id, ...dataToUpdate } = updateData;
    await updateDoc(petRef, dataToUpdate);
  } catch (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
}

// ============================================================================
// Conversation Operations
// ============================================================================

// Example: Create a new conversation for a pet
export async function createConversation(conversationInput: CreateConversationInput): Promise<string> {
  try {
    const conversationsRef = collection(db, 'conversations');
    const docRef = await addDoc(conversationsRef, {
      ...conversationInput,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

// Example: Get a conversation by ID
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      return null;
    }

    return {
      id: conversationSnap.id,
      ...conversationSnap.data(),
      createdAt: conversationSnap.data().createdAt.toDate(),
    } as Conversation;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

// Example: Get all conversations for a pet
export async function getPetConversations(petId: string): Promise<Conversation[]> {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('petId', '==', petId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    } as Conversation));
  } catch (error) {
    console.error('Error getting pet conversations:', error);
    throw error;
  }
}

// ============================================================================
// Message Operations
// ============================================================================

// Example: Add a message to a conversation
export async function createMessage(messageInput: CreateMessageInput): Promise<string> {
  try {
    const messagesRef = collection(db, 'conversations', messageInput.conversationId, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...messageInput,
      feedback: null,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

// Example: Get all messages in a conversation
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const querySnapshot = await getDocs(messagesRef);

    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Message))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
}

// Example: Update message feedback (thumbs up/down)
export async function updateMessageFeedback(
  conversationId: string,
  messageId: string,
  feedback: 'up' | 'down' | null
): Promise<void> {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, { feedback });
  } catch (error) {
    console.error('Error updating message feedback:', error);
    throw error;
  }
}

// ============================================================================
// SERVER-SIDE USAGE (API Routes, Server Components, Server Actions)
// ============================================================================

// Note: Import adminAuth and adminDb in your server-side code
// Example usage in an API route or server action:

/**
 * Example API Route (app/api/verify-token/route.ts):
 *
 * import { adminAuth } from '@/lib/firebase-admin';
 * import { NextRequest, NextResponse } from 'next/server';
 *
 * export async function POST(request: NextRequest) {
 *   try {
 *     const { token } = await request.json();
 *
 *     // Verify the ID token
 *     const decodedToken = await adminAuth.verifyIdToken(token);
 *     const uid = decodedToken.uid;
 *
 *     return NextResponse.json({ uid, email: decodedToken.email });
 *   } catch (error) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 * }
 */

/**
 * Example Server Action for Pets (app/actions/pets.ts):
 *
 * 'use server';
 *
 * import { adminDb } from '@/lib/firebase-admin';
 * import type { Pet, CreatePetInput } from '@/types';
 *
 * export async function createPetServer(petInput: CreatePetInput): Promise<string> {
 *   try {
 *     const petRef = await adminDb.collection('pets').add({
 *       ...petInput,
 *       createdAt: new Date(),
 *     });
 *     return petRef.id;
 *   } catch (error) {
 *     console.error('Error creating pet:', error);
 *     throw error;
 *   }
 * }
 *
 * export async function getUserPetsServer(userId: string): Promise<Pet[]> {
 *   try {
 *     const petsSnapshot = await adminDb
 *       .collection('pets')
 *       .where('userId', '==', userId)
 *       .get();
 *
 *     return petsSnapshot.docs.map(doc => ({
 *       id: doc.id,
 *       ...doc.data(),
 *       createdAt: doc.data().createdAt.toDate(),
 *     } as Pet));
 *   } catch (error) {
 *     console.error('Error fetching pets:', error);
 *     throw error;
 *   }
 * }
 */

/**
 * Example Server Action for Conversations (app/actions/conversations.ts):
 *
 * 'use server';
 *
 * import { adminDb } from '@/lib/firebase-admin';
 * import type { Conversation, Message, CreateMessageInput } from '@/types';
 *
 * export async function createConversationServer(petId: string): Promise<string> {
 *   try {
 *     const conversationRef = await adminDb.collection('conversations').add({
 *       petId,
 *       createdAt: new Date(),
 *     });
 *     return conversationRef.id;
 *   } catch (error) {
 *     console.error('Error creating conversation:', error);
 *     throw error;
 *   }
 * }
 *
 * export async function addMessageToConversation(
 *   messageInput: CreateMessageInput
 * ): Promise<string> {
 *   try {
 *     const messageRef = await adminDb
 *       .collection('conversations')
 *       .doc(messageInput.conversationId)
 *       .collection('messages')
 *       .add({
 *         ...messageInput,
 *         feedback: null,
 *         createdAt: new Date(),
 *       });
 *     return messageRef.id;
 *   } catch (error) {
 *     console.error('Error adding message:', error);
 *     throw error;
 *   }
 * }
 *
 * export async function getConversationMessagesServer(
 *   conversationId: string
 * ): Promise<Message[]> {
 *   try {
 *     const messagesSnapshot = await adminDb
 *       .collection('conversations')
 *       .doc(conversationId)
 *       .collection('messages')
 *       .orderBy('createdAt', 'asc')
 *       .get();
 *
 *     return messagesSnapshot.docs.map(doc => ({
 *       id: doc.id,
 *       ...doc.data(),
 *       createdAt: doc.data().createdAt.toDate(),
 *     } as Message));
 *   } catch (error) {
 *     console.error('Error fetching messages:', error);
 *     throw error;
 *   }
 * }
 */
