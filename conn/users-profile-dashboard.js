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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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

// Reference to the Firebase Realtime Database
const dbRef = firebase.database().ref('UsersAccount/' + userId); // Replace 'userId' with the actual user ID

// Fetch the profile picture from Firebase
dbRef.once('value', (snapshot) => {
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const profileImageUrl = userData.p_picture;

        if (profileImageUrl) {
            const profileImage = document.getElementById('profileImage');
            const dpicture = document.getElementById('dp');
            profileImage.src = profileImageUrl;
            dpicture.src = profileImageUrl;
        }
    } else {
        console.log("No user data found!");
    }
}, (error) => {
    console.error("Error fetching user data:", error);
});

// Display placeholder content immediately to reduce perceived delay
function showPlaceholder() {
  const fullNameSpan = document.getElementById("fullNameSp");
  const fullNameh6 = document.getElementById("fullName");
  const fullNameh62 = document.getElementById("full-name");
  const positionSpan = document.getElementById("position");
  const positionh6 = document.getElementById("position2");
  const firstN = document.getElementById("fname");
  const lastN = document.getElementById("lname");
  const bDay = document.getElementById("b-day");
  const address = document.getElementById("add");
  const lice = document.getElementById("licensed");
  const positionDiv = document.getElementById("position3");
  const availability = document.getElementById("avail");
  const tVessel = document.getElementById("t-vess");
  const experience = document.getElementById("exp");
  const resume = document.getElementById("res");
  const email = document.getElementById("em");
  const mNum = document.getElementById("m-num");

  fullNameSpan.textContent = "Loading...";
  fullNameh6.textContent = "Loading...";
  fullNameh62.textContent = "Loading...";
  positionSpan.textContent = "Loading...";
  positionh6.textContent = "Loading...";
  firstN.textContent = "Loading...";
  lastN.textContent = "Loading...";
  bDay.textContent = "Loading...";
  address.textContent = "Loading...";
  lice.textContent = "Loading...";
  positionDiv.textContent = "Loading...";
  availability.textContent = "Loading...";
  tVessel.textContent = "Loading...";
  experience.textContent = "Loading...";
  resume.textContent = "Loading...";
  email.textContent = "Loading...";
  mNum.textContent = "Loading...";
}

// Fetch user details and update the profile name in real-time
function updateProfileName() {
  const userId = sessionStorage.getItem("uid");
  const fullNameSpan = document.getElementById("fullNameSp");
  const fullNameh6 = document.getElementById("fullName");
  const fullNameh62 = document.getElementById("full-name");
  const positionSpan = document.getElementById("position");
  const positionh6 = document.getElementById("position2");
  const firstN = document.getElementById("fname");
  const lastN = document.getElementById("lname");
  const bDay = document.getElementById("b-day");
  const address = document.getElementById("add");
  const lice = document.getElementById("licensed");
  const positionDiv = document.getElementById("position3");
  const availability = document.getElementById("avail");
  const tVessel = document.getElementById("t-vess");
  const experience = document.getElementById("exp");
  const resume = document.getElementById("res");
  const email = document.getElementById("em");
  const mNum = document.getElementById("m-num");

  // Show placeholder while fetching data
  showPlaceholder();

  if (userId) {
    const userRef = database.ref("UsersAccount/" + userId);

    // Real-time listener using 'on' method
    userRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firstName = data.firstname;
        const lastName = data.lastname;
        const birthD = data.bdate;
        const addr = data.address;
        const lices = data.higherLicensed;
        const pos = data.position;
        const availa = data.availability;
        const typeVessel = data.typeOfVessel;
        const exper = data.experience;
        const resum = data.resume;
        const emai = data.email;
        const mobileNum = data.mobile_number;
        

        if (firstName && lastName) {
          const initials = firstName.charAt(0) + ". " + lastName;
          fullNameSpan.textContent = initials;

          // Update the dropdown header with full name and user position
          fullNameh6.textContent = `${firstName} ${lastName}`;
          fullNameh62.textContent = `${firstName} ${lastName}`;
          positionSpan.textContent = pos;
          positionh6.textContent = pos;
          firstN.textContent = firstName;
          lastN.textContent = lastName;
          bDay.textContent = birthD;
          address.textContent = addr;
          lice.textContent = lices;
          positionDiv.textContent = pos;
          availability.textContent = availa;
          tVessel.textContent = typeVessel;
          experience.textContent = exper;
          resume.textContent = resum;
          email.textContent = emai;
          mNum.textContent = mobileNum;
        } else {
          console.error("First name or last name not found in database.");
        }
      } else {
        console.error("User data not found in database.");
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
    });
  }
}

// Call the function to update the profile name in real-time
updateProfileName();


