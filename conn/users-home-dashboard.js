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

// Check session at the start (similar to PHP's session_start())
const userType = sessionStorage.getItem("user_type");
const userId = sessionStorage.getItem("uid");

if (!userType || !userId) {
  // Redirect to the login page if session is missing
  alert("Session expired or not found. Please log in again.");
  window.location.href = "../../login.html";
} else if (userType !== "Applicant") {
  // If the user type is not "Applicant", redirect to login
  alert("Unauthorized access. Redirecting to login.");
  window.location.href = "../../login.html";
} else {
  console.log("Session exists: user_type = " + userType + ", uid = " + userId);
}

// Preventing the browser back button from navigating back
window.onload = function () {
  // Clear the history state and push a new one
  history.pushState(null, "", location.href);
  history.replaceState(null, "", location.href);

  // Listen for the popstate event (triggered when the back button is clicked)
  window.addEventListener("popstate", function () {
    // Push the state again to make it impossible to go back
    history.pushState(null, "", location.href);
    history.replaceState(null, "", location.href);
  });
};

// Logout function
function logout() {
  // Clear session storage and redirect to login page
  sessionStorage.clear();
  window.location.href = "../../login.html";
}


