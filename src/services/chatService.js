// src/services/chatService.js
import {
  collection, doc, addDoc, query, orderBy,
  onSnapshot, serverTimestamp, getDoc, setDoc, updateDoc
} from 'firebase/firestore'
import { db } from './firebaseConfig'

/**
 * Generate chat ID deterministik dari dua uid
 * Selalu sama urutan apapun siapa sender/receiver
 */
export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

/**
 * Buat atau ambil dokumen chat
 */
export async function ensureChat(uid1, uid2) {
  const chatId = getChatId(uid1, uid2)
  const ref    = doc(db, 'chats', chatId)
  const snap   = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      members:    [uid1, uid2],
      createdAt:  serverTimestamp(),
      lastMsg:    '',
      lastMsgAt:  serverTimestamp(),
    })
  }
  return chatId
}

/**
 * Kirim pesan
 */
export async function sendMessage(chatId, senderId, text) {
  const msgRef  = collection(db, 'chats', chatId, 'messages')
  const chatRef = doc(db, 'chats', chatId)

  await addDoc(msgRef, {
    text,
    sender_id:  senderId,
    created_at: serverTimestamp(),
  })

  await updateDoc(chatRef, {
    lastMsg:   text.slice(0, 80),
    lastMsgAt: serverTimestamp(),
  })
}

/**
 * Realtime listener untuk messages
 */
export function listenMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('created_at', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Ambil semua chat yang melibatkan user (untuk list inbox)
 */
export function listenMyChats(uid, callback) {
  const q = query(collection(db, 'chats'))
  return onSnapshot(q, snap => {
    const chats = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.members?.includes(uid))
      .sort((a, b) => (b.lastMsgAt?.seconds || 0) - (a.lastMsgAt?.seconds || 0))
    callback(chats)
  })
}
