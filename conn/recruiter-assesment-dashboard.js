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

  // Reference to AssesmentForm in Firebase
const assesmentRef = database.ref("AssesmentForm");

// Handle Form Submission
document.getElementById("assesmentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get input values
    const assesmentName = document.getElementById("assesment-name").value.trim();
    const lessonLink = document.getElementById("lesson-link").value.trim();
    const gFormLink = document.getElementById("g-form-link").value.trim();
    const time = document.getElementById("time").value.trim();
    const date = document.getElementById("date").value.trim();
    const expiration = document.getElementById("expiration").value.trim();

    if (assesmentName === "" || lessonLink === "" || gFormLink === "" || time === "" || date === "" || expiration === "") {
        alert("All fields are required.");
        return;
    }

    // Save data to Firebase
    assesmentRef.child(assesmentName).set({
        lesson_link: lessonLink,
        g_form_link: gFormLink,
        time: time,
        date: date,
        expiration: expiration
    }, (error) => {
        if (error) {
            alert("Error saving data: " + error.message);
        } else {
            alert("Assessment saved successfully!");
            document.getElementById("assesmentForm").reset(); // Clear form
        }
    });
});

// Load and display assessments in the table
function loadAssessments() {
    assesmentRef.on("value", (snapshot) => {
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = ""; // Clear existing data

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const assesmentName = childSnapshot.key;

                const row = `
                    <tr>
                        <td>${assesmentName}</td>
                        <td><a href="${data.lesson_link}" target="_blank">${data.lesson_link}</a></td>
                        <td><a href="${data.g_form_link}" target="_blank">${data.g_form_link}</a></td>
                        <td>${data.time}</td>
                        <td>${data.date}</td>
                        <td>${data.expiration}</td>
                        <td>
                            <button type="button" class="btn btn-success" onclick="view('${assesmentName}')">View</button>
                        </td>
                        <td><button class="btn btn-danger" onclick="deleteAssessment('${assesmentName}')">Delete</button></td>
                    </tr>
                `;

                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No assessments found.</td></tr>`;
        }
    });
}

function view(assesmentName) {
    sessionStorage.setItem("selected_assesment_name", assesmentName); // Store selected RFID key
    window.location.href = "assesment-view-dashboard.html"; // Navigate to history page
}

// Delete assessment function
function deleteAssessment(assesmentName) {
    if (confirm("Are you sure you want to delete this assessment?")) {
        assesmentRef.child(assesmentName).remove()
            .then(() => {
                alert("Assessment deleted successfully!");
            })
            .catch((error) => {
                alert("Error deleting assessment: " + error.message);
            });
    }
}

function filterTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.querySelector("table tbody");
    let rows = table.getElementsByTagName("tr");

    for (let row of rows) {
        let assesment_name = row.cells[0].textContent.toLowerCase();

        // Show row if any column matches the search input
        if (
            assesment_name.includes(input)
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
  loadAssessments();

  
  
  
  
  