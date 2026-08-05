'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    firebase: any
  }
}

export default function FirebaseInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.firebase && !window.firebase.apps?.length) {
      window.firebase.initializeApp({
        apiKey: 'AIzaSyBzR7oVD3bv-klEdJYXy0UcAYIhnUgB5IM',
        authDomain: 'web-thinker-1aad0.firebaseapp.com',
        databaseURL: 'https://web-thinker-1aad0-default-rtdb.asia-southeast1.firebasedatabase.app',
        projectId: 'web-thinker-1aad0',
        storageBucket: 'web-thinker-1aad0.firebasestorage.app',
        messagingSenderId: '51887374718',
        appId: '1:51887374718:web:0fa7b6a658946c0890332f',
      })
    }
  }, [])
  return null
}