import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const isConfigured = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your_'));

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    const databaseId = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID;
    db = databaseId && databaseId !== '(default)' ? getFirestore(app, databaseId) : getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }
}

export { app, db, auth, firebaseConfig, isConfigured };
