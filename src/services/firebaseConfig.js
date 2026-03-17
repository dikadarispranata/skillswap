// src/services/firebaseConfig.js
// ⚠️  Ganti dengan konfigurasi Firebase proyekmu sendiri
// Buat project di: https://console.firebase.google.com
// Aktifkan: Authentication > Google & Email/Password

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyB7ok4q_VWbTiJdhkH-a1eYWTn3bclRz8M",
  authDomain:        "skillswap-app-de0a8.firebaseapp.com",
  projectId:         "skillswap-app-de0a8",
  storageBucket:     "skillswap-app-de0a8.firebasestorage.app",
  messagingSenderId: "932801076543",
  appId:             "1:932801076543:web:4135211d5a09710f14c78a",
  measurementId:     "G-35DJFSQQ85"
}

const app = initializeApp(firebaseConfig)
export const auth           = getAuth(app)
export const db             = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
