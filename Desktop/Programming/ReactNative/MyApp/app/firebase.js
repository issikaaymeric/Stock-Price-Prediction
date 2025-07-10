// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBJcxy5Vn-Qw7NvdOPxFFWKjktlF9Sc0Og",
  authDomain: "myapp-4c96d.firebaseapp.com",
  projectId: "myapp-4c96d",
  storageBucket: "myapp-4c96d.firebasestorage.app",
  messagingSenderId: "433273489262",
  appId: "1:433273489262:web:69a9eb92ebe044ae4d237f",
  measurementId: "G-53CW918SM0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export const storage = getStorage(app);
