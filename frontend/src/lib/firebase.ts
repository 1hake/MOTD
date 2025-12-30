import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCvch2ijeMIePrGUxe9hbhCl3agSyHoWO0',
  authDomain: 'diggerz-12d95.firebaseapp.com',
  projectId: 'diggerz-12d95',
  storageBucket: 'diggerz-12d95.firebasestorage.app',
  messagingSenderId: '901020365110',
  appId: '1:901020365110:web:e453fb7f223e86581d4397',
  measurementId: 'G-YDJP7X4X72'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app
