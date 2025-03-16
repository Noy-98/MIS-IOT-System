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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Check session at the start
const userType = sessionStorage.getItem("user_type");
const userId = sessionStorage.getItem("uid");

if (!userType || !userId) {
  alert("Session expired or not found. Please log in again.");
  window.location.href = "../../login.html";
} else if (userType !== "Applicant") {
  alert("Unauthorized access. Redirecting to login.");
  window.location.href = "../../login.html";
} else {
  console.log("Session exists: user_type = " + userType + ", uid = " + userId);
}

// Preventing the browser back button
window.onload = function () {
  history.pushState(null, "", location.href);
  history.replaceState(null, "", location.href);
  window.addEventListener("popstate", function () {
      history.pushState(null, "", location.href);
      history.replaceState(null, "", location.href);
  });
};

// Logout function
function logout() {
  sessionStorage.clear();
  window.location.href = "../../login.html";
}

// Function to load RFID attendance data for the logged-in user
function loadRfid() {
  const tbody = document.querySelector("tbody"); // Get tbody of the table

  // Fetch the logged-in user's details
  const userRef = database.ref("UsersAccount/" + userId);
  userRef.once("value", (userSnapshot) => {
      if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const currentFirstName = userData.firstname;
          const currentLastName = userData.lastname;
          const currentEmail = userData.email;

          const rfidRef = database.ref("ScanTag");

          rfidRef.on("value", (snapshot) => {
              tbody.innerHTML = ""; // Clear table before adding new data
              let hasData = false;

              snapshot.forEach((childSnapshot) => {
                  const rfid = childSnapshot.val();
                  const rfidKey = childSnapshot.key;

                  // Validate if the RFID entry matches the logged-in user's details
                  if (
                      rfid.firstname === currentFirstName &&
                      rfid.lastname === currentLastName &&
                      rfid.email === currentEmail
                  ) {
                      hasData = true;
                      const row = document.createElement("tr");
                      row.innerHTML = `
                          <td>${rfidKey}</td>
                          <td>${rfid.lastname || ""}, ${rfid.firstname || ""}</td>
                          <td>${rfid.email || ""}</td>
                          <td>${rfid.attendance_status || ""}</td>
                          <td>${rfid.time_in || ""}</td>
                          <td>${rfid.time_out || ""}</td>
                          <td>${rfid.date || ""}</td>
                          <td>${rfid.rfid_status || ""}</td>
                          <td>
                              <button type="button" class="btn btn-success" onclick="viewHistory('${rfidKey}')">View</button>
                          </td>
                      `;
                      tbody.appendChild(row);
                  }
              });

              // If no matching data found, show message
              if (!hasData) {
                  tbody.innerHTML = "<tr><td colspan='9' class='text-center'>No attendance records found.</td></tr>";
              }
          });
      } else {
          console.error("User data not found.");
      }
  });
}

// Function to view attendance history
function viewHistory(rfidKey) {
  sessionStorage.setItem("selected_rfidKey", rfidKey);
  window.location.href = "attendance-view-history-dashboard.html";
}

// Fetch user details and update the profile name in real-time
function updateProfileName() {
  const fullNameSpan = document.getElementById("fullNameSp");
  const fullNameh6 = document.getElementById("fullName");
  const positionSpan = document.getElementById("position");

  fullNameSpan.textContent = "Loading...";
  fullNameh6.textContent = "Loading...";
  positionSpan.textContent = "Loading...";

  if (userId) {
      const userRef = database.ref("UsersAccount/" + userId);

      userRef.on("value", (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const firstName = data.firstname;
              const lastName = data.lastname;
              const pos = data.position;

              if (firstName && lastName) {
                  const initials = firstName.charAt(0) + ". " + lastName;
                  fullNameSpan.textContent = initials;

                  fullNameh6.textContent = `${firstName} ${lastName}`;
                  positionSpan.textContent = pos;
              }
          }
      });
  }
}

// Load profile picture
const dbRef = firebase.database().ref("UsersAccount/" + userId);
dbRef.once("value", (snapshot) => {
  if (snapshot.exists()) {
      const userData = snapshot.val();
      const profileImageUrl = userData.p_picture;
      if (profileImageUrl) {
          document.getElementById("profileImage").src = profileImageUrl;
      }
  }
});

// Initialize functions
updateProfileName();
loadRfid();
