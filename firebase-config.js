import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxE43A8C5Fvy0jecQD-4iYmASrGgRtY6g",
  authDomain: "consultaemails-55dc7.firebaseapp.com",
  projectId: "consultaemails-55dc7",
  storageBucket: "consultaemails-55dc7.firebasestorage.app",
  messagingSenderId: "666632159596",
  appId: "1:666632159596:web:ec61c881762692e1f37349"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
