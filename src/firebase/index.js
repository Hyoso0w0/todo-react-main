import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCro_QrF9rIO3gZ8n3XOvUE8_xrr1DSSX4",
    authDomain: "todo-c2de5.firebaseapp.com",
    projectId: "todo-c2de5",
    storageBucket: "todo-c2de5.appspot.com",
    messagingSenderId: "57913086419",
    appId: "1:57913086419:web:a8504407e3590c66185f26",
    measurementId: "G-MC2S5GXR4Z"
  };
  
  const app =initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  export {auth, db};