# LetsVet - Pet Health Triage App

A Next.js 14 application for pet health triage and assessment.

## Getting Started

### Quick Start (Development with Firebase Emulator)

The easiest way to get started is using the Firebase Emulator Suite - no Firebase project or credentials needed!

1. **Install dependencies:**
```bash
npm install
```

2. **Install Firebase CLI (if not already installed):**
```bash
npm install -g firebase-tools
```

3. **Configure environment variables:**
```bash
cp .env.local.example .env.local
```

For development with emulator, you can use dummy values for Firebase client config or leave them as-is. Just uncomment the emulator host variables:
```bash
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

4. **Start the Firebase Emulator (in a separate terminal):**
```bash
npm run emulators
```

This will start:
- Authentication Emulator on port 9099
- Firestore Emulator on port 8080
- Emulator UI on http://localhost:4000

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Setup

For production deployment:

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore Database

2. **Get Firebase Configuration:**
   - Go to Project Settings > General
   - Copy your web app configuration values
   - Add them to `.env.local`:
     ```bash
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. **Get Service Account Key (for server-side operations):**
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Add the entire JSON as a single-line string to `.env.local`:
     ```bash
     FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
     ```

4. **Deploy Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and API clients
  - `firebase.ts` - Firebase client SDK (for client-side auth & firestore)
  - `firebase-admin.ts` - Firebase Admin SDK (for server-side operations)
- `/types` - TypeScript type definitions

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Authentication & Database)
- Anthropic Claude API

## Firebase Development

### Using Firebase Emulator

The Firebase Emulator Suite allows you to develop and test locally without connecting to production Firebase services:

**Benefits:**
- No Firebase project or credentials required
- Free and fast
- Data persists between sessions (can be exported/imported)
- Safe testing environment
- Emulator UI for viewing data at http://localhost:4000

**Available Scripts:**
```bash
npm run emulators          # Start emulators
npm run emulators:export   # Export emulator data to ./firebase-data
npm run emulators:import   # Start emulators with saved data
```

### Firebase Admin SDK

The Firebase Admin SDK in `/lib/firebase-admin.ts` automatically detects your environment:

**Development Mode** (with emulator):
- No credentials needed
- Set `FIREBASE_AUTH_EMULATOR_HOST` and `FIRESTORE_EMULATOR_HOST`
- Automatically connects to local emulator

**Production Mode**:
- Requires `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
- Or use Application Default Credentials on Google Cloud

### Security Rules

Firestore security rules are defined in `firestore.rules`:
- Users can only read/write their own data
- Triage sessions are protected by user authentication
- Rules are enforced in both emulator and production

## API Routes & Server Components

Use the Firebase Admin SDK in API routes and server components:

```typescript
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Verify ID tokens
const decodedToken = await adminAuth.verifyIdToken(token);

// Access Firestore with elevated privileges
const doc = await adminDb.collection('users').doc(userId).get();
```

See `/lib/firebase-examples.ts` for more usage examples.
