// src/services/swapService.js
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseConfig'

/** Update profil user di Firestore */
export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}
