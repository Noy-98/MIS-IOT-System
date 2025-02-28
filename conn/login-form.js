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

const maxAttempts = 3;
const lockoutTime = 6 * 60 * 1000; // 6 minutes in milliseconds

// Check lockout state on page load
checkLockout();

// Load saved credentials if "Remember Me" was checked
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("rememberMe") === "true") {
    emailInput.value = localStorage.getItem("savedEmail") || "";
    passwordInput.value = localStorage.getItem("savedPassword") || "";
    rememberMeCheckbox.checked = true;
  }
});

// Handle form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (isLockedOut()) {
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  usersRef.orderByChild("email").equalTo(email).once("value", (snapshot) => {
    if (!snapshot.exists()) {
      handleFailedAttempt();
    } else {
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.password !== password) {
          handleFailedAttempt();
        } else {
          resetAttempts();

          if (rememberMeCheckbox.checked) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("savedEmail", email);
            localStorage.setItem("savedPassword", password);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("savedPassword");
          }

          window.location.href = "index.html";
        }
      });
    }
  });
});

function handleFailedAttempt() {
  let attempts = parseInt(localStorage.getItem("loginAttempts")) || 0;
  attempts++;

  if (attempts >= maxAttempts) {
    localStorage.setItem("loginLockoutTime", Date.now());
    showError(`Too many failed attempts. Try again in 6 minutes.`);
    checkLockout();
  } else {
    localStorage.setItem("loginAttempts", attempts);
    showError(`Incorrect email or password. Attempts left: ${maxAttempts - attempts}`);
  }
}

function resetAttempts() {
  localStorage.removeItem("loginAttempts");
  localStorage.removeItem("loginLockoutTime");
}

function isLockedOut() {
  const lockoutTimeStart = localStorage.getItem("loginLockoutTime");
  if (!lockoutTimeStart) return false;

  const timeElapsed = Date.now() - parseInt(lockoutTimeStart);
  if (timeElapsed >= lockoutTime) {
    resetAttempts();
    return false;
  }

  return true;
}

function checkLockout() {
  if (isLockedOut()) {
    let timeRemaining = lockoutTime - (Date.now() - parseInt(localStorage.getItem("loginLockoutTime")));
    showError(`Too many failed attempts. Try again in ${formatTime(timeRemaining)}`);
    startCountdown(timeRemaining);
  }
}

function startCountdown(timeRemaining) {
  const interval = setInterval(() => {
    timeRemaining -= 1000;
    if (timeRemaining <= 0) {
      clearInterval(interval);
      resetAttempts();
      errorMessage.style.display = "none";
    } else {
      errorMessage.textContent = `Too many failed attempts. Try again in ${formatTime(timeRemaining)}`;
    }
  }, 1000);
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}
