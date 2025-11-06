import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { Pet } from '@/types';

/**
 * Create a new pet in Firestore
 *
 * @param userId - The ID of the user who owns the pet
 * @param petData - Pet data without id, userId, and createdAt
 * @returns The created pet with id
 */
export async function createPet(
  userId: string,
  petData: Omit<Pet, 'id' | 'userId' | 'createdAt'>
): Promise<Pet> {
  try {
    const petsRef = collection(db, 'pets');

    // Prepare the document data with userId and createdAt
    const docData = {
      userId,
      ...petData,
      createdAt: Timestamp.now(),
    };

    // Add the document to Firestore
    const docRef = await addDoc(petsRef, docData);

    // Return the created pet with id and Date objects
    return {
      id: docRef.id,
      userId,
      ...petData,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating pet:', error);
    throw new Error('Failed to create pet');
  }
}

/**
 * Get all pets for a specific user
 *
 * @param userId - The ID of the user
 * @returns Array of Pet objects
 */
export async function getUserPets(userId: string): Promise<Pet[]> {
  try {
    const petsRef = collection(db, 'pets');
    const q = query(petsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        species: data.species,
        age: data.age,
        breed: data.breed,
        weight: data.weight,
        gender: data.gender || 'Male', // Default to 'Male' for backward compatibility
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Pet;
    });
  } catch (error) {
    console.error('Error getting user pets:', error);
    throw new Error('Failed to fetch pets');
  }
}

/**
 * Get a single pet by ID
 *
 * @param petId - The ID of the pet
 * @returns Pet object or null if not found
 */
export async function getPetById(petId: string): Promise<Pet | null> {
  try {
    const petRef = doc(db, 'pets', petId);
    const petSnap = await getDoc(petRef);

    if (!petSnap.exists()) {
      return null;
    }

    const data = petSnap.data();
    return {
      id: petSnap.id,
      userId: data.userId,
      name: data.name,
      species: data.species,
      age: data.age,
      breed: data.breed,
      weight: data.weight,
      gender: data.gender || 'Male', // Default to 'Male' for backward compatibility
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Pet;
  } catch (error) {
    console.error('Error getting pet:', error);
    throw new Error('Failed to fetch pet');
  }
}
