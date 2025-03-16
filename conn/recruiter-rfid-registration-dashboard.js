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

function loadRfid() {
    const rfidRef = database.ref("ScanTag");
    const tbody = document.querySelector("tbody"); // Get tbody of the table

    rfidRef.on("value", (snapshot) => {
        tbody.innerHTML = ""; // Clear table before adding new data

        snapshot.forEach((childSnapshot) => {
            const rfid = childSnapshot.val();
            const rfidKey = childSnapshot.key;

            // Create table row dynamically
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
                <td>
                    <button type="button" class="btn btn-danger" onclick="deleteRFID('${rfidKey}')">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    });
}

// Function to delete user from Firebase
function deleteRFID(rfidKey) {
    if (confirm("Are you sure you want to delete this rfid?")) {
        const rfidRef = database.ref("ScanTag/" + rfidKey);
        rfidRef.remove()
            .then(() => {
                console.log("Rfid deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting rfid:", error);
            });
    }
}

// Function to filter the table based on search input
function filterTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.querySelector("table tbody");
    let rows = table.getElementsByTagName("tr");

    for (let row of rows) {
        let firstname = row.cells[1].textContent.toLowerCase();
        let lastname = row.cells[1].textContent.toLowerCase();
        let email = row.cells[2].textContent.toLowerCase();
        let status = row.cells[3].textContent.toLowerCase();

        // Show row if any column matches the search input
        if (
            firstname.includes(input) || 
            lastname.includes(input) || 
            email.includes(input) || 
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
  loadRfid();

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("rfidRegistrationForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        // Get input values from the form
        const rfid = document.getElementById("rfID").value.trim();
        const firstname = document.getElementById("first-name").value.trim();
        const lastname = document.getElementById("last-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const attendanceStatus = document.getElementById("attendacnce-status").value.trim();
        const timeIn = document.getElementById("time-in").value.trim();
        const timeOut = document.getElementById("time-out").value.trim();
        const date = document.getElementById("date").value.trim();
        const rfidStatus = document.getElementById("rfid-status").value.trim();

        if (rfid === "") {
            alert("RFID field cannot be empty!");
            return;
        }

        // Reference to the Firebase database path
        const dbRef = firebase.database().ref("ScanTag/" + rfid);

        // Check if RFID exists in Firebase
        dbRef.once("value", (snapshot) => {
            if (snapshot.exists()) {
                // RFID found, update data
                const updatedData = {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    attendance_status: attendanceStatus,
                    time_in: timeIn,
                    time_out: timeOut,
                    date: date,
                    rfid_status: rfidStatus
                };

                dbRef.update(updatedData)
                    .then(() => {
                        alert("RFID data updated successfully!");
                        form.reset(); // Clear the form after submission
                    })
                    .catch((error) => {
                        console.error("Error updating data: ", error);
                        alert("Failed to update RFID data. Please try again.");
                    });
            } else {
                // RFID not found
                alert("Error: RFID not found in the database. Please check the ID.");
            }
        }).catch((error) => {
            console.error("Error checking RFID existence:", error);
            alert("Database error. Please try again.");
        });
    });
});


  
  
  
  
  