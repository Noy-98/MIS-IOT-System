const firebaseConfig = {
  apiKey: "AIzaSyDgHMGvGUa-i8GzJrU3SFD3ER78rlFpShQ",
  authDomain: "mis-system-proj.firebaseapp.com",
  databaseURL: "https://mis-system-proj-default-rtdb.firebaseio.com",
  projectId: "mis-system-proj",
  storageBucket: "mis-system-proj.firebasestorage.app",
  messagingSenderId: "393254491698",
  appId: "1:393254491698:web:6931aa358e6bc686c80e2b",
  measurementId: "G-6VEP444ZBV"
};

firebase.initializeApp(firebaseConfig);

const usersRef = firebase.database().ref("UsersAccount");
const loginForm = document.getElementById("loginForm");
const errorMessage = document.querySelector(".error-message");
const rememberMeCheckbox = document.getElementById("exampleCheck1");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let loginAttempts = 3;
let lockoutTime = 6 * 60 * 1000; // 6 minutes in milliseconds
let isLocked = false;

// Load saved credentials if "Remember Me" was checked
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("rememberMe") === "true") {
    emailInput.value = localStorage.getItem("savedEmail") || "";
    passwordInput.value = localStorage.getItem("savedPassword") || "";
    rememberMeCheckbox.checked = true;
  }
});

// Function to check login attempt lock
function checkLockout() {
  const lockTime = localStorage.getItem("lockTime");
  if (lockTime) {
    const timePassed = Date.now() - parseInt(lockTime);
    if (timePassed < lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - timePassed) / 1000);
      errorMessage.innerHTML = `Too many failed attempts. Try again in ${remainingTime} seconds.`;
      isLocked = true;
      return true;
    } else {
      localStorage.removeItem("lockTime");
      loginAttempts = 3;
      isLocked = false;
      return false;
    }
  }
  return false;
}

// Function to display error message
function showError(message) {
  errorMessage.innerHTML = message;
  errorMessage.style.display = "block";
}

// Handle form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (checkLockout()) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  usersRef.orderByChild("email").equalTo(email).once("value", (snapshot) => {
    if (!snapshot.exists()) {
      loginAttempts--;
      showError("Email does not exist.");
    } else {
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.password !== password) {
          loginAttempts--;
          showError("Incorrect password.");
        } else {
          // Store credentials if "Remember Me" is checked
          if (rememberMeCheckbox.checked) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("savedEmail", email);
            localStorage.setItem("savedPassword", password);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("savedPassword");
          }

          localStorage.removeItem("lockTime");
          loginAttempts = 3;
          errorMessage.style.display = "none";
          window.location.href = "index.html";
          return;
        }
      });
    }

    if (loginAttempts <= 0) {
      localStorage.setItem("lockTime", Date.now());
      showError("Too many failed attempts. Locked for 6 minutes.");
    }
  });
});
