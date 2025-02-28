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
const changedPasswordRef = firebase.database().ref("UsersChangedPasswordRequest");

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const errorMessage = document.querySelector(".error-message");
const sentMessage = document.querySelector(".sent-message");
const loadingIndicator = document.querySelector(".loading");

const maxAttempts = 3;
const lockoutTime = 6 * 60 * 1000; // 6 minutes in milliseconds

// Check lockout state on page load
checkLockout();

forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isLockedOut()) {
    return;
  }

  const email = emailInput.value.trim();
  if (!email) {
    showErrorMessage("Please enter an email.");
    return;
  }

  loadingIndicator.style.display = "block";
  errorMessage.style.display = "none";
  sentMessage.style.display = "none";

  try {
    const snapshot = await usersRef.once("value");
    let userData = null;
    let userKey = null;

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.email === email) {
        userData = data;
        userKey = childSnapshot.key;
      }
    });

    if (!userData) {
      handleFailedAttempt();
    } else {
      resetAttempts();

      delete userData.password;

      await changedPasswordRef.child(userKey).set(userData);

      sentMessage.textContent = "Verification successful. Redirecting...";
      sentMessage.style.display = "block";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  } catch (error) {
    showErrorMessage("An error occurred. Please try again.");
  } finally {
    loadingIndicator.style.display = "none";
  }
});

function handleFailedAttempt() {
  let attempts = parseInt(localStorage.getItem("forgotPasswordAttempts")) || 0;
  attempts++;

  if (attempts >= maxAttempts) {
    localStorage.setItem("forgotPasswordLockoutTime", Date.now());
    showErrorMessage(`Too many failed attempts. Try again in 6 minutes.`);
    checkLockout();
  } else {
    localStorage.setItem("forgotPasswordAttempts", attempts);
    showErrorMessage(`Email not found. Attempts left: ${maxAttempts - attempts}`);
  }
}

function resetAttempts() {
  localStorage.removeItem("forgotPasswordAttempts");
  localStorage.removeItem("forgotPasswordLockoutTime");
}

function isLockedOut() {
  const lockoutTimeStart = localStorage.getItem("forgotPasswordLockoutTime");
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
    let timeRemaining = lockoutTime - (Date.now() - parseInt(localStorage.getItem("forgotPasswordLockoutTime")));
    showErrorMessage(`Too many failed attempts. Try again in ${formatTime(timeRemaining)}`);
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

function showErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}
