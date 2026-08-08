import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig: Record<string, string> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBvuWzLAThSEPh3PwAI1Jzo7v0ZjQ4f1gI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aurora-social-media.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aurora-social-media',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aurora-social-media.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '373387083077',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:373387083077:web:463c596f76836971b9522c'
}
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
if (measurementId) firebaseConfig.measurementId = measurementId

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

const USE_EMULATORS = import.meta.env.VITE_FIREBASE_EMULATORS === 'true'
if (USE_EMULATORS) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}

// Only load analytics in the browser (not during SSR/build)
if (typeof window !== 'undefined') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => ok && getAnalytics(app)))
    .catch(() => {})
}
