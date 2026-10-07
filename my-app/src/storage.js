import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadUserFile(user, file) {
  const fileRef = ref(storage, `users/${user.uid}/${file.name}`)
  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
  })

  return getDownloadURL(snapshot.ref)
}