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
  } else if (userType !== "Admin") {
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

  // Function to load users from Firebase
function loadUsers() {
    const usersRef = database.ref("UsersAccount");
    const tbody = document.querySelector("tbody"); // Get tbody of the table

    usersRef.on("value", (snapshot) => {
        tbody.innerHTML = ""; // Clear table before adding new data

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            const uid = childSnapshot.key;

            // Determine the class based on status
            let statusClass = "bg-warning"; // Default: Processing
            if (user.status === "Approved") statusClass = "bg-success";
            else if (user.status === "Decline") statusClass = "bg-danger";

            // Create table row dynamically
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.firstname || ""}</td>
                <td>${user.lastname || ""}</td>
                <td>${user.bdate || ""}</td>
                <td>${user.address || ""}</td>
                <td>${user.higherLicensed || ""}</td>
                <td>${user.position || ""}</td>
                <td>${user.availability || ""}</td>
                <td>${user.typeOfVessel || ""}</td>
                <td>${user.experience || ""}</td>
                <td><iframe src="${user.resume || ""}" width="400px" height="300px" style="border: 2px solid #ccc;"></iframe></td>
                <td>${user.email || ""}</td>
                <td>${user.mobile_number || ""}</td>
                <td>${user.user_type || ""}</td>
                <td><span class="badge ${statusClass}">${user.status || "Processing"}</span></td>
                <td>
                    <button type="button" class="btn btn-success" onclick="updateStatus('${uid}', 'Approved')">Approve</button>
                </td>
                <td>
                    <button type="button" class="btn btn-warning" onclick="updateStatus('${uid}', 'Decline')">Decline</button>
                </td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="deleteUser('${uid}')">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    });
}

// Function to update status in Firebase
function updateStatus(uid, newStatus) {
    const userRef = database.ref("UsersAccount/" + uid);
    userRef.update({ status: newStatus })
        .then(() => {
            console.log("Status updated successfully!");
        })
        .catch((error) => {
            console.error("Error updating status:", error);
        });
}

// Function to delete user from Firebase
function deleteUser(uid) {
    if (confirm("Are you sure you want to delete this user?")) {
        const userRef = database.ref("UsersAccount/" + uid);
        userRef.remove()
            .then(() => {
                console.log("User deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
            });
    }
}

// Function to filter the table based on search input
function filterTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.querySelector("table tbody");
    let rows = table.getElementsByTagName("tr");

    for (let row of rows) {
        let firstname = row.cells[0].textContent.toLowerCase();
        let lastname = row.cells[1].textContent.toLowerCase();
        let email = row.cells[10].textContent.toLowerCase();
        let type = row.cells[12].textContent.toLowerCase();
        let status = row.cells[13].textContent.toLowerCase();

        // Show row if any column matches the search input
        if (
            firstname.includes(input) || 
            lastname.includes(input) || 
            email.includes(input) || 
            type.includes(input) || 
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

  loadUsers();
  
  
  
  
  