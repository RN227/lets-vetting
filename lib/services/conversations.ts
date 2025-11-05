import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import type { Conversation, Message } from '@/types';

/**
 * Create a new conversation in Firestore
 *
 * @param petId - The ID of the pet this conversation is about
 * @returns The conversation id
 */
export async function createConversation(petId: string): Promise<string> {
  try {
    const conversationsRef = collection(db, 'conversations');

    // Prepare the document data
    const docData = {
      petId,
      createdAt: Timestamp.now(),
    };

    // Add the document to Firestore
    const docRef = await addDoc(conversationsRef, docData);

    // Return the conversation id
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

/**
 * Add a message to a conversation
 *
 * @param conversationId - The ID of the conversation
 * @param role - The role of the message sender ('user' or 'assistant')
 * @param content - The message content
 * @returns The message id
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> {
  try {
    const messagesRef = collection(db, 'messages');

    // Prepare the document data
    const docData = {
      conversationId,
      role,
      content,
      feedback: null,
      createdAt: Timestamp.now(),
    };

    // Add the document to Firestore
    const docRef = await addDoc(messagesRef, docData);

    // Return the message id
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message');
  }
}

/**
 * Get all messages for a conversation, ordered by creation time
 *
 * @param conversationId - The ID of the conversation
 * @returns Array of Message objects ordered by createdAt (oldest first)
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);

    // Filter messages by conversationId and map to Message objects
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          role: data.role,
          content: data.content,
          feedback: data.feedback,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Message;
      })
      .filter((message) => message.conversationId === conversationId);
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw new Error('Failed to fetch messages');
  }
}

/**
 * Update the feedback field on a message
 *
 * @param messageId - The ID of the message to update
 * @param feedback - The feedback value ('up' or 'down')
 * @returns Success boolean
 */
export async function updateMessageFeedback(
  messageId: string,
  feedback: 'up' | 'down'
): Promise<boolean> {
  try {
    const messageRef = doc(db, 'messages', messageId);

    // Update the feedback field
    await updateDoc(messageRef, {
      feedback,
    });

    return true;
  } catch (error) {
    console.error('Error updating message feedback:', error);
    throw new Error('Failed to update message feedback');
  }
}
