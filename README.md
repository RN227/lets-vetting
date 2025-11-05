# LetsVet - Pet Health Triage App

A Next.js 14 application for pet health triage and assessment.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore Database
   - Get your Firebase config from Project Settings
   - Download the service account key for Firebase Admin (Settings → Service Accounts → Generate New Private Key)

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```
   - Add your Firebase client configuration (NEXT_PUBLIC_* variables)
   - Add your Firebase Admin service account JSON (FIREBASE_SERVICE_ACCOUNT_KEY)
   - Add your Anthropic API key (ANTHROPIC_API_KEY)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
