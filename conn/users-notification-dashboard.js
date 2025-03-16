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

// Preventing the browser back button from navigating back
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

// Reference to Firebase
const notificationRef = database.ref("NotificationForm");
const userRef = database.ref("UsersAccount/" + userId);

// Function to load notifications and filter by email
function loadNotifications(userEmail) {
    notificationRef.on("value", (snapshot) => {
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = ""; // Clear existing data

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                // Validate if the notification is for the current user
                if (data.to === userEmail) {
                    const row = `
                        <tr>
                            <td>${data.subject}</td>
                            <td>${data.from}</td>
                            <td>${data.to}</td>
                            <td>${data.time}</td>
                            <td>${data.date}</td>
                            <td>${data.message}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                }
            });

            // If no notifications match, display a message
            if (tbody.innerHTML === "") {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center">No notifications found.</td></tr>`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No notifications found.</td></tr>`;
        }
    });
}

// Fetch user email and then load notifications
userRef.once("value", (snapshot) => {
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const userEmail = userData.email;

        if (userEmail) {
            loadNotifications(userEmail);
        } else {
            console.error("User email not found!");
        }
    } else {
        console.error("User data not found!");
    }
}, (error) => {
    console.error("Error fetching user data:", error);
});

// Function to filter table content based on search input
function filterTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.querySelector("table tbody");
    let rows = table.getElementsByTagName("tr");

    for (let row of rows) {
        let subject = row.cells[0].textContent.toLowerCase();
        let from = row.cells[1].textContent.toLowerCase();
        let to = row.cells[2].textContent.toLowerCase();

        if (subject.includes(input) || from.includes(input) || to.includes(input)) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    }
}

// Fetch user profile picture
const dbRef = database.ref("UsersAccount/" + userId);
dbRef.once("value", (snapshot) => {
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const profileImageUrl = userData.p_picture;

        if (profileImageUrl) {
            const profileImage = document.getElementById("profileImage");
            profileImage.src = profileImageUrl;
        }
    } else {
        console.log("No user data found!");
    }
}, (error) => {
    console.error("Error fetching user data:", error);
});

// Display placeholder content immediately
function showPlaceholder() {
    const fullNameSpan = document.getElementById("fullNameSp");
    const fullNameh6 = document.getElementById("fullName");
    const positionSpan = document.getElementById("position");

    fullNameSpan.textContent = "Loading...";
    fullNameh6.textContent = "Loading...";
    positionSpan.textContent = "Loading...";
}

// Fetch user details and update the profile name
function updateProfileName() {
    showPlaceholder();

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
                    document.getElementById("fullNameSp").textContent = initials;
                    document.getElementById("fullName").textContent = `${firstName} ${lastName}`;
                    document.getElementById("position").textContent = pos;
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

// Call functions
updateProfileName();
