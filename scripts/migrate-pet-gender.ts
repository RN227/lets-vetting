/**
 * Migration script to add gender field to existing pets in Firestore
 * 
 * This script will:
 * 1. Fetch all pets that don't have a gender field
 * 2. Set a default gender value (defaults to 'Male')
 * 
 * Usage:
 * 1. Set environment variable: FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
 *    OR set FIRESTORE_EMULATOR_HOST for local emulator
 * 2. Run: npx tsx scripts/migrate-pet-gender.ts
 * 
 * Note: This requires Firebase Admin SDK to be configured
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (similar to lib/firebase-admin.ts)
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  const isEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST ||
                     process.env.FIRESTORE_EMULATOR_HOST;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Production: Use service account credentials
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else if (isEmulator) {
    // Development: Use emulator (no credentials needed)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project';
    initializeApp({
      projectId,
    });
    console.log(`Connected to Firebase Emulator (Project: ${projectId})`);
  } else {
    console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set');
    console.error('Or set FIRESTORE_EMULATOR_HOST for local emulator');
    process.exit(1);
  }

  return getFirestore();
}

const db = initializeFirebaseAdmin();

async function migratePetGender() {
  try {
    console.log('Starting migration...');
    
    // Fetch all pets
    const petsRef = db.collection('pets');
    const snapshot = await petsRef.get();
    
    if (snapshot.empty) {
      console.log('No pets found in database');
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each pet in batches
    let batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Only update pets that don't have a gender field
      if (!data.gender) {
        batch.update(doc.ref, { gender: 'Male' }); // Default to 'Male'
        updatedCount++;
        batchCount++;
        
        // Commit batch if we reach the limit
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          batch = db.batch(); // Create new batch
          batchCount = 0;
        }
      } else {
        skippedCount++;
      }
    }
    
    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`Migration complete!`);
    console.log(`- Updated: ${updatedCount} pets`);
    console.log(`- Skipped (already have gender): ${skippedCount} pets`);
    console.log(`- Total: ${snapshot.size} pets`);
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migratePetGender()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

