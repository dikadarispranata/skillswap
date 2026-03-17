// src/services/userService.js
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from './firebaseConfig'
import { uploadToCloudinary } from './cloudinaryService'

/**
 * Update profil user di Firestore & Firebase Auth
 */
export async function updateUserProfile(uid, data) {
  const docRef = doc(db, 'users', uid)
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
  if (auth.currentUser) {
    const authUpdate = {}
    if (data.name)     authUpdate.displayName = data.name
    if (data.photoURL) authUpdate.photoURL    = data.photoURL
    if (Object.keys(authUpdate).length) await updateProfile(auth.currentUser, authUpdate)
  }
}

/**
 * Upload foto profil ke Cloudinary lalu simpan URL ke Firestore
 * @param {string} uid
 * @param {File} file
 * @param {(pct: number) => void} onProgress
 * @returns {Promise<string>} URL foto
 */
export async function uploadAvatar(uid, file, onProgress) {
  const url = await uploadToCloudinary(file, uid, onProgress)
  return url
}

