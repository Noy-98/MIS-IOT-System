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
  window.location.href = "MIS-IOT-System/login.html";
} else if (userType !== "Applicant") {
  // If the user type is not "Applicant", redirect to login
  alert("Unauthorized access. Redirecting to login.");
  window.location.href = "MIS-IOT-System/login.html";
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
  window.location.href = "MIS-IOT-System/login.html";
}

const storage = firebase.storage();
const storageRef = storage.ref();
const profilePicInput = document.createElement("input");
profilePicInput.type = "file";
profilePicInput.accept = "image/png, image/jpeg, image/jpg";

const resumeInput = document.getElementById("rE");
resumeInput.accept = "application/pdf";

// Open file explorer when clicking the updateProfilePic button
document.getElementById("updateProfilePic").addEventListener("click", () => {
    profilePicInput.click();
});

profilePicInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const profilePicPath = `Applicant Profile Pictures/${userId}_${file.name}`;
        const uploadTask = storageRef.child(profilePicPath).put(file);

        uploadTask.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
            database.ref(`UsersAccount/${userId}`).update({ p_picture: url });
            document.getElementById("dp2").src = url;
        }).catch(console.error);
    }
});

// Delete profile picture
document.getElementById("deleteProfilePic").addEventListener("click", () => {
    dbRef.once("value", (snapshot) => {
        const userData = snapshot.val();
        if (userData.p_picture && !userData.p_picture.includes("profile_icon.png")) {
            const fileRef = storage.refFromURL(userData.p_picture);
            fileRef.delete().then(() => {
                database.ref(`UsersAccount/${userId}`).update({ p_picture: "https://firebasestorage.googleapis.com/v0/b/incuhatchtech-proj.appspot.com/o/Applicant%20Profile%20Pictures%2Fprofile_icon.png?alt=media&token=10ed007b-0192-4966-8b06-6d9eb1bf72ac" });
                document.getElementById("dp2").src = "https://firebasestorage.googleapis.com/v0/b/incuhatchtech-proj.appspot.com/o/Applicant%20Profile%20Pictures%2Fprofile_icon.png?alt=media&token=10ed007b-0192-4966-8b06-6d9eb1bf72ac";
            }).catch(console.error);
        }
    });
});

// Open file explorer when clicking resume input field
resumeInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type === "application/pdf") {
        const resumePath = `Resumes/${userId}_${file.name}`;
        const uploadTask = storageRef.child(resumePath).put(file);

        uploadTask.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
            database.ref(`UsersAccount/${userId}`).update({ resume: url });
        }).catch(console.error);
    }
});

// Update all input fields on submit
document.getElementById("changeInfoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedData = {
        firstname: document.getElementById("fN").value,
        lastname: document.getElementById("lN").value,
        bdate: document.getElementById("bD").value,
        address: document.getElementById("aD").value,
        higherLicensed: document.getElementById("lD").value,
        position: document.getElementById("pN").value,
        availability: document.getElementById("aY").value,
        typeOfVessel: document.getElementById("tV").value,
        experience: document.getElementById("exP").value,
        mobile_number: document.getElementById("Phone").value,
    };
    database.ref(`UsersAccount/${userId}`).update(updatedData).then(() => {
        alert("Profile updated successfully");
    }).catch(console.error);
});

document.getElementById("changePasswordForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const user = firebase.auth().currentUser;
  if (!user) {
      alert("No user is currently logged in.");
      return;
  }

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const renewPassword = document.getElementById("renewPassword").value;

  // Validate new password length
  if (newPassword.length < 16) {
      alert("New password must be at least 16 characters long.");
      return;
  }

  // Validate password match
  if (newPassword !== renewPassword) {
      alert("New password and Re-entered password do not match.");
      return;
  }

  try {
      // Re-authenticate user with current password
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);

      // Update the password in Firebase Authentication
      await user.updatePassword(newPassword);

      alert("Password successfully updated!");
      document.getElementById("changePasswordForm").reset();
  } catch (error) {
      alert("Error: " + error.message);
  }
});



// Reference to the Firebase Realtime Database
const dbRef = firebase.database().ref('UsersAccount/' + userId); // Replace 'userId' with the actual user ID

// Fetch the profile picture from Firebase
dbRef.once('value', (snapshot) => {
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const profileImageUrl = userData.p_picture;
        const resumePdfUrl = userData.resume;

        if (profileImageUrl) {
            const profileImage = document.getElementById('profileImage');
            const dpicture = document.getElementById('dp');
            const dpicture2 = document.getElementById('dp2');
            profileImage.src = profileImageUrl;
            dpicture.src = profileImageUrl;
            dpicture2.src = profileImageUrl;
        }

        if (resumePdfUrl) {
          const resume = document.getElementById('res');
          resume.src = resumePdfUrl;
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


