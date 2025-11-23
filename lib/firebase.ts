import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDR9L5OXNkfM59QVIAO8tVBR8tP6Lo3wdI",
  authDomain: "fitness-tracker-3b9cd.firebaseapp.com",
  databaseURL: "https://fitness-tracker-3b9cd-default-rtdb.firebaseio.com",
  projectId: "fitness-tracker-3b9cd",
  storageBucket: "fitness-tracker-3b9cd.firebasestorage.app",
  messagingSenderId: "116523150550",
  appId: "1:116523150550:web:ddead872fa0c1c6275ad77",
  measurementId: "G-9T8JZ94X5N"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
