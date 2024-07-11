import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Check authentication status
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/signin.html"; // Redirect to sign-in page if not authenticated
  }
});
window.signOut = function () {
  signOut(auth)
    .then(() => {
      window.location.href = "/index.html"; // Redirect to home page after signing out
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
};

window.uploadImage = function (eventType) {
  const fileInput = document.getElementById(
    eventType === "upcoming" ? "upcomingImageUpload" : "ongoingImageUpload"
  );
  const files = fileInput.files;

  Array.from(files).forEach((file) => {
    const storageRef = ref(storage, `${eventType}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        // Progress function
      },
      function (error) {
        // Error function
        console.error("Upload failed:", error);
      },
      function () {
        // Complete function
        getDownloadURL(uploadTask.snapshot.ref).then(function (downloadURL) {
          saveImageToFirestore(downloadURL, eventType);
        });
      }
    );
  });
};

function saveImageToFirestore(url, eventType) {
  addDoc(collection(db, "images"), {
    url: url,
    eventType: eventType,
  })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      loadImages();
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

function loadImages() {
  document.getElementById("upcomingEvents").innerHTML = "";
  document.getElementById("ongoingEvents").innerHTML = "";

  getDocs(collection(db, "images")).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const div = document.createElement("div");
      const img = document.createElement("img");
      img.src = data.url;
      img.classList.add(
        "w-32",
        "h-32",
        "object-cover",
        "m-2",
        "border",
        "border-gray-300",
        "rounded"
      );

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "X";
      deleteButton.classList.add(
        "delete-btn",
        "px-2",
        "py-1",
        "absolute",
        "top-1",
        "right-1",
        "rounded-bl",
        "text-white",
        "bg-gray-700",
        "bg-opacity-70",
        "backdrop-blur-md"
      );
      deleteButton.onclick = function () {
        deleteImage(doc.id, data.url);
      };
      div.classList.add("relative");
      div.appendChild(img);
      div.appendChild(deleteButton);

      if (data.eventType === "upcoming") {
        document.getElementById("upcomingEvents").appendChild(div);
      } else {
        document.getElementById("ongoingEvents").appendChild(div);
      }
    });
  });
}

function deleteImage(docId, url) {
  deleteDoc(doc(db, "images", docId))
    .then(() => {
      const storageRef = ref(storage, url);
      deleteObject(storageRef)
        .then(() => {
          loadImages();
        })
        .catch((error) => {
          console.error("Error deleting image:", error);
        });
    })
    .catch((error) => {
      console.error("Error removing document:", error);
    });
}

window.previewImages = function (eventType) {
  const fileInput = document.getElementById(
    eventType === "upcoming" ? "upcomingImageUpload" : "ongoingImageUpload"
  );
  const previewDiv = document.getElementById(
    eventType === "upcoming" ? "upcomingImagePreview" : "ongoingImagePreview"
  );
  previewDiv.innerHTML = ""; // Clear previous preview

  const files = fileInput.files;
  if (files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add(
          "w-32",
          "h-32",
          "object-cover",
          "m-2",
          "border",
          "border-gray-300",
          "rounded"
        );
        previewDiv.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
};

window.onload = function () {
  loadImages();
};
