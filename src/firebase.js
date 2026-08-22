import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbzLe_YhKu9eyGPn4FBvORMRBsUqb2XLA",
  authDomain: "dayflow-hrms-86c4e.firebaseapp.com",
  projectId: "dayflow-hrms-86c4e",
  storageBucket: "dayflow-hrms-86c4e.firebasestorage.app",
  messagingSenderId: "576928560085",
  appId: "1:576928560085:web:39e6bb581be9205d49c35c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);