// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgHMGvGUa-i8GzJrU3SFD3ER78rlFpShQ",
    authDomain: "mis-system-proj.firebaseapp.com",
    databaseURL: "https://mis-system-proj-default-rtdb.firebaseio.com",
    projectId: "mis-system-proj",
    storageBucket: "mis-system-proj.appspot.com",
    messagingSenderId: "393254491698",
    appId: "1:393254491698:web:6931aa358e6bc686c80e2b",
    measurementId: "G-6VEP444ZBV"
};

// Check if Firebase has been initialized to prevent reinitialization errors
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Get a reference to the database
  const database = firebase.database();
  const auth = firebase.auth();
  
  // Authenticate user and get profile data
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      console.log("User authenticated:", userId);
  
      // Fetch user profile data from the database
      database
        .ref("users/" + userId)
        .once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("User profile data:", data);
  
            // Populate profile information
            document.getElementById("full-name").innerText = `${data.firstName} ${data.lastName}`;
            document.getElementById("p_picture").src = data.profilePicture || "../assets/img/profile-icon.png";
            document.getElementById("first-name").innerText = data.firstName || "N/A";
            document.getElementById("last-name").innerText = data.lastName || "N/A";
            document.getElementById("Email").value = data.email || "N/A";
            document.getElementById("Phone").value = data.phone || "N/A";
            document.getElementById("Address").value = data.address || "N/A";
          } else {
            console.error("No user profile found.");
          }
        })
        .catch((error) => {
          console.error("Error retrieving user profile:", error);
        });
    } else {
      console.error("User not authenticated.");
      alert("You are not logged in. Please sign in to view your profile.");
      // Redirect to login page
      window.location.href = "../auth/login.html";
    }
  });
  
  // Sign out function
  function signOut() {
    auth.signOut().then(() => {
      console.log("User signed out.");
      window.location.href = "../auth/login.html";
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  }
