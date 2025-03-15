const firebaseConfig = {
  apiKey: "AIzaSyAzLyrICF8KsRMPFpCyR9_BoiBQbzSWQB8",
  authDomain: "incuhatchtech-proj.firebaseapp.com",
  databaseURL: "https://incuhatchtech-proj-default-rtdb.firebaseio.com",
  projectId: "incuhatchtech-proj",
  storageBucket: "incuhatchtech-proj.appspot.com",
  messagingSenderId: "400858536985",
  appId: "1:400858536985:web:109eb10ba1992d5507de88",
  measurementId: "G-6YQX165W8B"
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
    // Check if the email exists in Firebase Authentication
    const authUser = await firebase.auth().fetchSignInMethodsForEmail(email);
    
    if (authUser.length > 0) {
      // Email found in Firebase Authentication, send reset email
      await firebase.auth().sendPasswordResetEmail(email);
      sentMessage.textContent = "Password reset link sent! Please check your email.";
      sentMessage.style.display = "block";
      resetAttempts();
    } else {
      // Check if the email exists in Firebase Realtime Database
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

      if (userData) {
        // Email found in Realtime Database, send reset email
        await firebase.auth().sendPasswordResetEmail(email);
        sentMessage.textContent = "Password reset link sent! Please check your email.";
        sentMessage.style.display = "block";

        // Optionally, save the reset request in the database
        delete userData.password;
        await changedPasswordRef.child(userKey).set(userData);
        resetAttempts();
      } else {
        // Email not found in both Authentication and Database
        handleFailedAttempt();
        showErrorMessage("No account found with this email.");
      }
    }
  } catch (error) {
    handleFailedAttempt();
    if (error.code === "auth/invalid-email") {
      showErrorMessage("Invalid email address.");
    } else if (error.code === "auth/user-not-found") {
      showErrorMessage("No account found with this email.");
    } else {
      showErrorMessage("An error occurred. Please try again.");
    }
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
