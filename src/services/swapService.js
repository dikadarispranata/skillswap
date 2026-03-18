// src/services/swapService.js
import {
  collection, doc, addDoc, updateDoc, query,
  where, onSnapshot, serverTimestamp, getDocs, getDoc
} from 'firebase/firestore'
import { db } from './firebaseConfig'

/**
 * Ambil semua user yang cocok untuk di-swap:
 * skills_have mereka mengandung salah satu dari skills_want kita
 */
export async function getMatchingUsers(currentUser) {
  if (!currentUser?.skills_want?.length) return []

  const ref  = collection(db, 'users')
  const snap = await getDocs(ref)

  const matches = []
  snap.forEach(d => {
    if (d.id === currentUser.uid) return
    const data = d.data()
    // Hitung skor kecocokan
    const theyHaveIWant = (data.skills_have || []).filter(s =>
      currentUser.skills_want.includes(s)
    )
    const iHaveTheyWant = (currentUser.skills_have || []).filter(s =>
      (data.skills_want || []).includes(s)
    )
    const score = theyHaveIWant.length + iHaveTheyWant.length
    if (theyHaveIWant.length > 0 || iHaveTheyWant.length > 0) {
      matches.push({ ...data, uid: d.id, _score: score, theyHaveIWant, iHaveTheyWant })
    }
  })

  // Urutkan berdasarkan skor tertinggi
  return matches.sort((a, b) => b._score - a._score)
}

/**
 * Kirim swap request
 */
export async function sendSwapRequest(senderId, receiverId, message = '') {
  return addDoc(collection(db, 'swaps'), {
    sender_id:   senderId,
    receiver_id: receiverId,
    message,
    status:      'pending',
    timestamp:   serverTimestamp(),
  })
}

/**
 * Update status swap (accepted / rejected / completed)
 */
export async function updateSwapStatus(swapId, status) {
  await updateDoc(doc(db, 'swaps', swapId), { status, updatedAt: serverTimestamp() })
}

/**
 * Realtime listener: swap yang dikirim OLEH user
 */
export function listenSentSwaps(uid, callback) {
  const q = query(collection(db, 'swaps'), where('sender_id', '==', uid))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Realtime listener: swap yang diterima OLEH user
 */
export function listenReceivedSwaps(uid, callback) {
  const q = query(collection(db, 'swaps'), where('receiver_id', '==', uid))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Cek status swap antara dua user
 * Returns: null | { id, status, isSender }
 */
export async function getSwapBetween(uid1, uid2) {
  const q1 = query(collection(db, 'swaps'),
    where('sender_id',   '==', uid1),
    where('receiver_id', '==', uid2)
  )
  const q2 = query(collection(db, 'swaps'),
    where('sender_id',   '==', uid2),
    where('receiver_id', '==', uid1)
  )
  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
  if (!s1.empty) return { id: s1.docs[0].id, ...s1.docs[0].data(), isSender: true }
  if (!s2.empty) return { id: s2.docs[0].id, ...s2.docs[0].data(), isSender: false }
  return null
}
