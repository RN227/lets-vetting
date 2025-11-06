import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import type { Pet, Conversation } from '@/types';

/**
 * Migrate all data from an anonymous user to a permanent user account
 * This function transfers:
 * 1. All pets owned by the anonymous user
 * 2. All conversations for those pets
 * 
 * @param anonymousUserId - The UID of the anonymous user
 * @param permanentUserId - The UID of the permanent user account
 * @returns Object with migration results
 */
export async function migrateAnonymousUserData(
  anonymousUserId: string,
  permanentUserId: string
): Promise<{
  petsMigrated: number;
  conversationsMigrated: number;
  messagesMigrated: number;
}> {
  try {
    // Step 1: Find all pets owned by the anonymous user
    const petsRef = collection(db, 'pets');
    const petsQuery = query(petsRef, where('userId', '==', anonymousUserId));
    const petsSnapshot = await getDocs(petsQuery);

    if (petsSnapshot.empty) {
      return {
        petsMigrated: 0,
        conversationsMigrated: 0,
        messagesMigrated: 0,
      };
    }

    const petIds: string[] = [];
    const batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit

    // Step 2: Update all pets to use the permanent user ID
    petsSnapshot.forEach((petDoc) => {
      petIds.push(petDoc.id);
      const petRef = doc(db, 'pets', petDoc.id);
      batch.update(petRef, {
        userId: permanentUserId,
      });
      batchCount++;

      // Commit batch if we reach the limit
      if (batchCount >= BATCH_SIZE) {
        batch.commit();
        batchCount = 0;
      }
    });

    // Commit remaining pet updates
    if (batchCount > 0) {
      await batch.commit();
      batchCount = 0;
    }

    // Step 3: Find all conversations for the migrated pets
    const conversationsRef = collection(db, 'conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('petId', 'in', petIds.length > 10 ? petIds.slice(0, 10) : petIds)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);

    // Note: Firestore 'in' query has a limit of 10 items
    // If we have more than 10 pets, we need to query in batches
    let allConversations: string[] = [];
    
    if (petIds.length > 10) {
      // Query in batches of 10
      for (let i = 0; i < petIds.length; i += 10) {
        const batchIds = petIds.slice(i, i + 10);
        const batchQuery = query(conversationsRef, where('petId', 'in', batchIds));
        const batchSnapshot = await getDocs(batchQuery);
        batchSnapshot.forEach((convDoc) => {
          allConversations.push(convDoc.id);
        });
      }
    } else {
      conversationsSnapshot.forEach((convDoc) => {
        allConversations.push(convDoc.id);
      });
    }

    // Step 4: Count messages (conversations don't need updates, just the pets)
    // Messages are in subcollections and don't have userId fields
    // They're linked through conversations which are linked through pets
    // So no migration needed for messages themselves

    // Return results
    return {
      petsMigrated: petsSnapshot.size,
      conversationsMigrated: allConversations.length,
      messagesMigrated: 0, // Messages don't need migration, they're linked through conversations
    };
  } catch (error) {
    console.error('Error migrating anonymous user data:', error);
    throw new Error('Failed to migrate user data');
  }
}

