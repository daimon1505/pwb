import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function createUserProfile(user) {
  const profileRef = doc(db, 'users', user.uid)
  const existingProfile = await getDoc(profileRef)

  if (!existingProfile.exists()) {
    await setDoc(profileRef, {
      email: user.email,
      createdAt: serverTimestamp(),
    })
  }
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? snapshot.data() : null
}