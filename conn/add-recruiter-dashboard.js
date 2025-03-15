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
  const usersRef = firebase.database().ref("UsersAccount");
  const recruiterForm = document.getElementById("addRecruiterForm");
  const dbRef = firebase.database().ref('UsersAccount/' + userId);
  
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


  recruiterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    toggleLoading(true);
    clearErrors();
  
    const firstname = getElementVal("first-name");
    const lastname = getElementVal("last-name");
    const bdate = getElementVal("b-date");
    const address = getElementVal("address");
    const higherLicensed = "N/A";
    const position = "N/A";
    const availability = "N/A";
    const typeOfVessel = "N/A";
    const experience = "N/A";
    const email = getElementVal("email");
    const mobile_number = getElementVal("mobile-number");
    const password = getElementVal("password");
    const confirmPassword = getElementVal("confirm-password");
    const status = "Approved";
    const p_picture = "https://firebasestorage.googleapis.com/v0/b/incuhatchtech-proj.appspot.com/o/Recruiter%20Profile%20Pictures%2Fprofile_icon.png?alt=media&token=5c5fbbc4-e494-4a15-bbf0-1bba7dae6d2a";
    const user_type = "Recruiter";
    const resumeUrl = "N/A";
  
    let errors = [];
  
    try {

      const emailExists = await checkIfEmailExists(email);
      if (emailExists) {
        errors.push("This email is already registered.");
      }
  
      if (mobile_number.length !== 11 || !/^\d{11}$/.test(mobile_number)) {
        errors.push("Invalid mobile number. It must be exactly 11 digits.");
      }
  
      if (password.length < 16) {
        errors.push("Password must be at least 16 characters long.");
      }
  
      if (password !== confirmPassword) {
        errors.push("Passwords do not match.");
      }
  
      if (errors.length > 0) {
        showErrors(errors);
        toggleLoading(false);
        return;
      }
  
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.sendEmailVerification();
      const uid = userCredential.user.uid;
      
      await saveUserData(uid, firstname, lastname, bdate, address, higherLicensed, position, availability, typeOfVessel, experience, resumeUrl, email, mobile_number, status, p_picture, user_type);
      toggleLoading(false);
      showSuccess("Recruiter Added successful! Verification email sent.");
      recruiterForm.reset();
    } catch (error) {
      console.error("Error during signup:", error);
      showErrors([error.message]);
      toggleLoading(false);
    }
  });

  const checkIfEmailExists = async (email) => {
    try {
        const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
        return snapshot.exists();
      } catch (error) {
        console.error("Error checking email:", error);
        return false;
      }
  };

  const saveUserData = async (uid, firstname, lastname, bdate, address, higherLicensed, position, availability, typeOfVessel, experience, resumeUrl, email, mobile_number, status, p_picture, user_type) => {
    try {
      await database.ref("UsersAccount/" + uid).set({
        firstname,
        lastname,
        bdate,
        address,
        higherLicensed,
        position,
        availability,
        typeOfVessel,
        experience,
        resumeUrl,
        email,
        mobile_number,
        status,
        p_picture,
        user_type
      });
      console.log("User data saved successfully");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };
  
  function getElementVal(id) {
    return document.getElementById(id).value.trim();
  }  
  
  function toggleLoading(isLoading) {
    const loading = document.querySelector(".loading");
    if (loading) {
      loading.style.display = isLoading ? "block" : "none";
    }
  }
  
  function showErrors(errors) {
    const errorMessage = document.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.innerHTML = errors.join("<br>");
      errorMessage.style.display = "block";
    }
  }
  
  function showSuccess(message) {
    const successMessage = document.querySelector(".sent-message");
    if (successMessage) {
      successMessage.innerHTML = message;
      successMessage.style.display = "block";
    }
  }

  function clearErrors() {
    console.log("Clearing errors...");
    
    // Assuming you have error messages inside elements with the class "error-message"
    let errorElements = document.querySelectorAll(".error-message");
    
    errorElements.forEach(element => {
        element.innerText = ""; // Clears the text
    });
}
  
  
  // Call the function to update the profile name in real-time
  updateProfileName();

  
  
  
  
  