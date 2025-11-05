# Vercel Deployment Guide

This guide will help you deploy LetsVet to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com/signup))
2. Your Firebase project credentials
3. Your Anthropic API key

## Step 1: Push Your Code to GitHub

1. Make sure all your changes are committed:
   ```bash
   git add -A
   git commit -m "Ready for deployment"
   ```

2. Push to your GitHub repository:
   ```bash
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will automatically detect it's a Next.js project
5. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add the following:

### Required Firebase Client Variables (NEXT_PUBLIC_*)

These are exposed to the browser, so they must start with `NEXT_PUBLIC_`:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., `your-project.firebaseapp.com`)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID

### Required Server-Side Variables

- `ANTHROPIC_API_KEY` - Your Anthropic Claude API key

### Optional Firebase Admin Variable (for server-side operations)

- `FIREBASE_SERVICE_ACCOUNT_KEY` - Your Firebase service account JSON (as a single-line string)

**Important**: 
- Add these variables for **Production**, **Preview**, and **Development** environments (or select the appropriate ones)
- After adding variables, you'll need to **redeploy** for them to take effect

## Step 4: Configure Firebase Auth Domain

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication > Settings > Authorized domains**
4. Add your Vercel domain:
   - `your-project.vercel.app` (production)
   - `your-project-git-*.vercel.app` (preview deployments)
   - Or your custom domain if you have one

## Step 5: Deploy Firestore Rules

If you haven't already deployed your Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

## Step 6: Verify Deployment

1. After deployment completes, visit your Vercel URL
2. Test the authentication flow
3. Test creating a pet
4. Test the chat functionality

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Verify your `package.json` has the correct build script
- Check the build logs in Vercel dashboard

### Authentication Not Working

- Verify Firebase Auth domain is authorized in Firebase Console
- Check that `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches your Firebase project
- Ensure Firebase Authentication is enabled in Firebase Console

### API Routes Not Working

- Check that `ANTHROPIC_API_KEY` is set correctly
- Verify server-side environment variables are set (not just `NEXT_PUBLIC_*`)
- Check Vercel function logs for errors

### Firestore Not Working

- Ensure Firestore is enabled in Firebase Console
- Verify Firestore security rules are deployed
- Check that `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update Firebase Auth authorized domains to include your custom domain

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to your main/master branch
- **Preview**: When you push to other branches or create pull requests

Each preview deployment gets its own URL for testing.

## Environment Variables Priority

Vercel environment variables override:
1. `.env.local` (local development)
2. `.env.production` (if exists)
3. `.env` (if exists)

Make sure all production values are set in Vercel dashboard.

