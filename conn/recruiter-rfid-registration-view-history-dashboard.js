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
  
  // Check session at the start (similar to PHP's session_start())
  const userType = sessionStorage.getItem("user_type");
  const userId = sessionStorage.getItem("uid");
  
  if (!userType || !userId) {
    // Redirect to the login page if session is missing
    alert("Session expired or not found. Please log in again.");
    window.location.href = "../../login.html";
  } else if (userType !== "Recruiter") {
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

  function loadRfidHistory() {
    const rfidKey = sessionStorage.getItem("selected_rfidKey"); // Get selected RFID key
    if (!rfidKey) {
        alert("No RFID selected. Redirecting...");
        window.location.href = "recruiter-rfid-registration-dashboard.html"; // Redirect back if no RFID selected
        return;
    }

    const rfidRef = database.ref("HistoryScanTag/" + rfidKey);
    const tbody = document.querySelector("tbody"); // Get tbody of the table

    rfidRef.on("value", (snapshot) => {
        tbody.innerHTML = ""; // Clear table before adding new data

        snapshot.forEach((childSnapshot) => {
            const log = childSnapshot.val();
            const logKey = childSnapshot.key;

            // Create table row dynamically
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${logKey}</td>
                <td>${log.attendance_status || ""}</td>
                <td>${log.time_in || ""}</td>
                <td>${log.time_out || ""}</td>
                <td>${log.date || ""}</td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="deleteLogs('${rfidKey}', '${logKey}')">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    });
}

// Function to delete history log
function deleteLogs(rfidKey, logKey) {
    if (confirm("Are you sure you want to delete this log?")) {
        const logRef = database.ref("HistoryScanTag/" + rfidKey + "/" + logKey);
        logRef.remove()
            .then(() => {
                console.log("Log deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting log:", error);
            });
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", loadRfidHistory);


// Function to filter the table based on search input
function filterTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.querySelector("table tbody");
    let rows = table.getElementsByTagName("tr");

    for (let row of rows) {
        let status = row.cells[1].textContent.toLowerCase();

        // Show row if any column matches the search input
        if (
            status.includes(input)
        ) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    }
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
              profileImage.src = profileImageUrl;
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
    const positionSpan = document.getElementById("position");
  
    fullNameSpan.textContent = "Loading...";
    fullNameh6.textContent = "Loading...";
    positionSpan.textContent = "Loading...";
  }
  
  // Fetch user details and update the profile name in real-time
  function updateProfileName() {
    const userId = sessionStorage.getItem("uid");
    const fullNameSpan = document.getElementById("fullNameSp");
    const fullNameh6 = document.getElementById("fullName");
    const positionSpan = document.getElementById("position");
  
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
          const pos = data.position;
  
          if (firstName && lastName) {
            const initials = firstName.charAt(0) + ". " + lastName;
            fullNameSpan.textContent = initials;
  
            // Update the dropdown header with full name and user position
            fullNameh6.textContent = `${firstName} ${lastName}`;
            positionSpan.textContent = pos;
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


  
  
  
  
  