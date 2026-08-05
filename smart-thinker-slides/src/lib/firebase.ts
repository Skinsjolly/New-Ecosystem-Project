let initialized = false

export function initFirebase() {
  if (typeof window === 'undefined') return
  if (initialized) return
  const firebase = (window as any).firebase
  if (!firebase) return
  if (firebase.apps && firebase.apps.length > 0) {
    initialized = true
    return
  }
  firebase.initializeApp({
    apiKey: 'AIzaSyBzR7oVD3bv-klEdJYXy0UcAYIhnUgB5IM',
    authDomain: 'web-thinker-1aad0.firebaseapp.com',
    databaseURL: 'https://web-thinker-1aad0-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'web-thinker-1aad0',
    storageBucket: 'web-thinker-1aad0.firebasestorage.app',
    messagingSenderId: '51887374718',
    appId: '1:51887374718:web:0fa7b6a658946c0890332f',
  })
  initialized = true
}

export async function signInWithGooglePopup(): Promise<{ idToken: string; user: { email: string; displayName: string; photoURL: string } }> {
  const firebase = (window as any).firebase
  const provider = new firebase.auth.GoogleAuthProvider()
  const result = await firebase.auth().signInWithPopup(provider)
  const idToken = await result.user.getIdToken()
  return {
    idToken,
    user: {
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    },
  }
}

export async function signOutFirebase() {
  const firebase = (window as any).firebase
  if (firebase) {
    await firebase.auth().signOut()
  }
}
