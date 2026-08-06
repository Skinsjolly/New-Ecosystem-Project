import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDBlMC8BmcZQGiS8lI0GKSXIqJTOpPWtuQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vibesky-1bd36.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vibesky-1bd36',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vibesky-1bd36.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '259823049175',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:259823049175:web:ccd453d3d665813b185392',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-M9WFS1T50G'
}

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
