// firebase/firebaseConfig.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBxeu9lBIerELkRbVitSyi61P8AyS0erdo",
  authDomain: "react-native-4cd88.firebaseapp.com",
  databaseURL: "https://react-native-4cd88-default-rtdb.firebaseio.com",
  projectId: "react-native-4cd88",
  storageBucket: "react-native-4cd88.appspot.com",
  messagingSenderId: "1058330646461",
  appId: "1:1058330646461:web:b737d8808d9ddde97224d4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, storage };
