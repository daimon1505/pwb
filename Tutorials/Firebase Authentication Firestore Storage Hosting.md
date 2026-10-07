# Firebase with React + Vite

This beginner-friendly guide shows how to add Firebase Authentication, Cloud Firestore, Cloud Storage, and Firebase Hosting to a React app created with Vite. The examples use the Firebase modular JavaScript SDK.

The commands below assume your app is in `my-app/`.

## What you will build

- Email/password sign up and sign in
- A Firestore profile document for each signed-in user
- File uploads to Cloud Storage
- A production build deployed to Firebase Hosting

## 1 — Create a Firebase project

1. Open the [Firebase console](https://console.firebase.google.com/).
2. Select **Create a project** and follow the setup steps.
3. In the project overview, click the **Web** icon (`</>`) to register a web app.
4. Give the app a nickname, such as `procedural-worldbuilding`.
5. Do not enable Firebase Hosting from this screen yet; it will be configured from the command line later.
6. Copy the Firebase configuration object. You will use its values in a local environment file.

## 2 — Install Firebase

Open Terminal and run:

```bash
cd /path/to/Procedural-Worldbuilding/my-app
npm install firebase
```

Firebase is a client-side SDK, so never put a service-account private key or other server credential in this React app. The web configuration values are safe to include in the browser; access is controlled by Authentication and Firebase Security Rules.

## 3 — Add environment variables

Create a file named `.env.local` in `my-app/`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Vite only exposes variables that begin with `VITE_`. Do not commit `.env.local` to Git. Add it to `.gitignore` if it is not already there:

```gitignore
.env.local
.env.*.local
```

The exact Storage bucket hostname is shown in the Firebase console. New projects commonly use `your-project-id.firebasestorage.app`; older projects may use `your-project-id.appspot.com`.

## 4 — Initialize Firebase in React

Create `src/firebase.js`:

```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

Restart the Vite dev server after creating or changing `.env.local`:

```bash
npm run dev
```

## 5 — Enable Authentication

1. In the Firebase console, open **Build > Authentication**.
2. Click **Get started**.
3. Open the **Sign-in method** tab.
4. Enable **Email/Password** and save.

Create `src/auth.js` with small reusable functions:

```js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logOut() {
  return signOut(auth)
}
```

To react to login and logout, subscribe once in a React component:

```jsx
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  return user ? <p>Signed in as {user.email}</p> : <p>Please sign in.</p>
}

export default App
```

In a real form, wrap calls in `try/catch` and display a friendly message for errors such as `auth/invalid-credential` or `auth/email-already-in-use`.

## 6 — Save user data in Firestore

Firestore is a document database. A useful convention is one profile document at `users/{uid}` for every authenticated user.

```js
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
```

Call `createUserProfile(user)` after a successful sign-up. To read the profile later:

```js
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? snapshot.data() : null
}
```

For data that should update live, use `onSnapshot` instead of `getDoc`. For lists, use queries with `where`, `orderBy`, and `limit` rather than downloading an entire collection.

## 7 — Upload files with Cloud Storage

1. In the Firebase console, open **Build > Storage**.
2. Click **Get started**.
3. Choose a region and finish setup.

Create `src/storage.js`:

```js
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadUserFile(user, file) {
  const fileRef = ref(storage, `users/${user.uid}/${file.name}`)
  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
  })

  return getDownloadURL(snapshot.ref)
}
```

Use it from a file input:

```jsx
async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file || !user) return

  const downloadUrl = await uploadUserFile(user, file)
  console.log(downloadUrl)
}

// Inside your component's JSX:
<input type="file" onChange={handleFileChange} />
```

Validate file type and size in the UI for a better experience, but rely on Storage Rules for security. Client-side checks alone can be bypassed.

## 8 — Add Firebase Security Rules

Rules are the authorization layer. In the Firebase console, open each product's **Rules** tab and publish rules similar to these examples.

### Firestore rules

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

### Storage rules

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

These rules let a signed-in user access only their own data. Before production, add validation for file size, content type, and the exact fields users may write. Never leave the Firebase Console's test-mode rules enabled in a public app.

## 9 — Configure Firebase Hosting

Install the Firebase CLI once:

```bash
npm install -g firebase-tools
firebase login
```

From the `my-app/` directory, initialize Hosting:

```bash
firebase init hosting
```

Choose these answers:

- Select the Firebase project you created.
- Use `dist` as the public directory.
- Configure as a single-page app: **Yes**.
- Set up automatic GitHub deploys: choose **No** unless you specifically want CI/CD.

Vite outputs its production files to `dist/`, so build before deploying:

```bash
npm run build
firebase deploy --only hosting
```

Firebase prints your live Hosting URL after deployment. Preview the same build locally with:

```bash
npm run preview
```

## 10 — Test the complete flow

1. Run `npm run dev` and open the local URL.
2. Create an account with Authentication.
3. Confirm a `users/{uid}` profile exists in Firestore.
4. Upload a small image and confirm it appears under `users/{uid}/` in Storage.
5. Sign out and verify protected actions no longer work.
6. Run `npm run build` and deploy with `firebase deploy --only hosting`.
7. Test the deployed URL in a private browser window.

## Common problems

### `FirebaseError: Missing or insufficient permissions`

The current user is not signed in, the document path does not match the rules, or the rules were not published. Check `request.auth` and the user's UID.

### Environment variables are `undefined`

Check that every variable starts with `VITE_`, that `.env.local` is inside `my-app/`, and that you restarted Vite after editing it.

### Hosting shows a blank page after refreshing a route

Re-run `firebase init hosting` and confirm that the app is configured as a single-page app. Then rebuild and deploy again.

### Storage upload fails

Confirm Storage is enabled, the bucket value matches the Firebase configuration, the user is signed in, and the Storage Rules allow that user's path.

## Useful official documentation

- [Firebase Web setup](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth/web/start)
- [Cloud Firestore](https://firebase.google.com/docs/firestore/quickstart)
- [Cloud Storage for Firebase](https://firebase.google.com/docs/storage/web/start)
- [Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)