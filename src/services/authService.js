// src/services/authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebaseConfig'

/** Buat dokumen user di Firestore jika belum ada */
async function ensureUserDoc(user, extraData = {}) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         user.uid,
      name:        user.displayName || extraData.name || '',
      email:       user.email,
      photoURL:    user.photoURL || '',
      skills_have: [],
      skills_want: [],
      rating_avg:  0,
      createdAt:   serverTimestamp(),
    })
  }
  return ref
}

/** Login dengan Email & Password */
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

/** Daftar dengan Email & Password */
export async function registerWithEmail(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await ensureUserDoc(cred.user, { name })
  return cred.user
}

/** Login dengan Google */
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  await ensureUserDoc(cred.user)
  return cred.user
}

/** Logout */
export async function logout() {
  await signOut(auth)
}
