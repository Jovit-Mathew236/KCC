import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCycFbzihXVBYAbeVWwbNGlm7fFGeOicb8",
  authDomain: "kcc24-277a5.firebaseapp.com",
  projectId: "kcc24-277a5",
  storageBucket: "kcc24-277a5.appspot.com",
  messagingSenderId: "980169847772",
  appId: "1:980169847772:web:a22c48a18a068014859519",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.signInWithGoogle = function () {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("User signed in:", result.user);
      // Redirect to the main page or perform other actions
      window.location.href = "/admin"; // Redirect to the main page
    })
    .catch((error) => {
      console.error("Error during Google sign-in:", error);
    });
};

window.signInWithEmail = function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed in:", userCredential.user);
      window.location.href = "/admin.html";
    })
    .catch((error) => {
      console.error("Error during email sign-in:", error);
    });
};

document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("signInForm");
  if (signInForm) {
    signInForm.addEventListener("submit", signInWithEmail);
  } else {
    console.error("Registration form element not found.");
  }
});
