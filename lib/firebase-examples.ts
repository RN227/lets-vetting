/**
 * Firebase Usage Examples
 *
 * This file contains examples of how to use Firebase client and admin SDK
 * in your LetsVet application. Remove this file in production.
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
  Timestamp
} from 'firebase/firestore';

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

// Example: Add a new pet to Firestore
export async function addPet(userId: string, petData: {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
}) {
  try {
    const petsRef = collection(db, 'users', userId, 'pets');
    const docRef = await addDoc(petsRef, {
      ...petData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding pet:', error);
    throw error;
  }
}

// Example: Get a user's pets
export async function getUserPets(userId: string) {
  try {
    const petsRef = collection(db, 'users', userId, 'pets');
    const querySnapshot = await getDocs(petsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pets:', error);
    throw error;
  }
}

// Example: Create a triage session
export async function createTriageSession(userId: string, petId: string, symptoms: string[]) {
  try {
    const triageRef = collection(db, 'triageSessions');
    const docRef = await addDoc(triageRef, {
      userId,
      petId,
      symptoms,
      urgency: null,
      assessment: null,
      createdAt: Timestamp.now(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating triage session:', error);
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
 * Example Server Action (app/actions/pets.ts):
 *
 * 'use server';
 *
 * import { adminDb, adminAuth } from '@/lib/firebase-admin';
 *
 * export async function getServerPetData(userId: string) {
 *   try {
 *     const petsSnapshot = await adminDb
 *       .collection('users')
 *       .doc(userId)
 *       .collection('pets')
 *       .get();
 *
 *     return petsSnapshot.docs.map(doc => ({
 *       id: doc.id,
 *       ...doc.data()
 *     }));
 *   } catch (error) {
 *     console.error('Error fetching pets:', error);
 *     throw error;
 *   }
 * }
 *
 * export async function createCustomToken(uid: string) {
 *   try {
 *     const customToken = await adminAuth.createCustomToken(uid);
 *     return customToken;
 *   } catch (error) {
 *     console.error('Error creating custom token:', error);
 *     throw error;
 *   }
 * }
 */
