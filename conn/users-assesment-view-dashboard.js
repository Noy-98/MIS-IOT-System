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
const storage = firebase.storage();

// Check session
const userType = sessionStorage.getItem("user_type");
const userId = sessionStorage.getItem("uid");
const assesmentName = sessionStorage.getItem("selected_assesment_name");

if (!userType || !userId || !assesmentName) {
    alert("Session expired or missing required data. Redirecting to login.");
    window.location.href = "../../login.html";
} else if (userType !== "Applicant") {
    alert("Unauthorized access. Redirecting to login.");
    window.location.href = "../../login.html";
} else {
    console.log(`Session verified: user_type = ${userType}, uid = ${userId}, assesment = ${assesmentName}`);
}

// Prevent browser back navigation
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

// Fetch and display user details in the form
const userRef = database.ref("UsersAccount/" + userId);
userRef.once("value", (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById("first-name").value = data.firstname;
        document.getElementById("last-name").value = data.lastname;
        document.getElementById("email").value = data.email;
        document.getElementById("user-position").value = data.position;
    } else {
        console.error("User data not found!");
    }
});

// Handle file selection and validation
const fileInput = document.getElementById("screenshot");
fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (file) {
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a PNG, JPG, or JPEG image.");
            fileInput.value = "";
        }
    }
});

// Handle form submission
document.getElementById("submissionForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const position = document.getElementById("user-position").value;
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a screenshot before submitting.");
        return;
    }

    // Upload image to Firebase Storage
    const storageRef = storage.ref(`Assesment Screenshots/${userId}_${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
        "state_changed",
        (snapshot) => {
            console.log(`Upload Progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
        },
        (error) => {
            console.error("Error uploading file:", error);
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log("File available at", downloadURL);

                // Save form data to Firebase Realtime Database
                const assessmentRef = database.ref(`ApplicantAssesmentForm/${assesmentName}/${lastName}`);
                assessmentRef.set({
                    email: email,
                    firstname: firstName,
                    lastname: lastName,
                    position: position,
                    screenshot: downloadURL, // Save image URL
                    status: "Done"
                })
                .then(() => {
                    alert("Submission successful!");
                    window.location.href = "home-dashboard.html"; // Redirect back
                })
                .catch((error) => {
                    console.error("Error saving data:", error);
                });
            });
        }
    );
});

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

updateProfileName();

function loadUserAssessments() {
    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = ""; // Clear existing table data

    // Fetch the current user's last name
    const userRef = database.ref("UsersAccount/" + userId);
    userRef.once("value", (userSnapshot) => {
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            const currentLastName = userData.lastname;

            const assessmentRef = database.ref(`ApplicantAssesmentForm/${assesmentName}`);

            assessmentRef.once("value", (snapshot) => {
                if (snapshot.exists()) {
                    let hasData = false;

                    snapshot.forEach((childSnapshot) => {
                        const data = childSnapshot.val();
                        const entryKey = childSnapshot.key;

                        // Only show data that matches the logged-in user's last name
                        if (data.lastname === currentLastName) {
                            hasData = true;

                            const row = document.createElement("tr");
                            row.innerHTML = `
                                <td>${assesmentName}</td>
                                <td>${data.firstname || "N/A"}</td>
                                <td>${data.lastname || "N/A"}</td>
                                <td>${data.email || "N/A"}</td>
                                <td>${data.position || "N/A"}</td>
                                <td>
                                    ${data.screenshot ? `<a href="${data.screenshot}" target="_blank">
                                        <img src="${data.screenshot}" alt="Screenshot" width="50"></a>` : "No Image"}
                                </td>
                                <td>${data.status || "Pending"}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteAssessment('${entryKey}')">Delete</button>
                                </td>
                            `;

                            tableBody.appendChild(row);
                        }
                    });

                    // If no matching data found, show message
                    if (!hasData) {
                        tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>No assessments found.</td></tr>";
                    }
                } else {
                    tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>No assessments found.</td></tr>";
                }
            }, (error) => {
                console.error("Error fetching assessments:", error);
            });
        } else {
            console.error("User data not found.");
        }
    });
}

// Function to delete an assessment entry
function deleteAssessment(entryKey) {
    if (confirm("Are you sure you want to delete this assessment?")) {
        const assessmentRef = database.ref(`ApplicantAssesmentForm/${assesmentName}/${entryKey}`);

        assessmentRef.remove()
            .then(() => {
                alert("Assessment deleted successfully!");
                loadUserAssessments(); // Refresh the table after deletion
            })
            .catch((error) => {
                console.error("Error deleting assessment:", error);
                alert("Failed to delete assessment.");
            });
    }
}

// Load the assessments when the page loads
document.addEventListener("DOMContentLoaded", loadUserAssessments);



