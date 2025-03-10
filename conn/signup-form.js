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

firebase.initializeApp(firebaseConfig);

const usersRef = firebase.database().ref("UsersAccount");
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  toggleLoading(true);
  clearErrors();

  const firstname = getElementVal("first-name");
  const lastname = getElementVal("last-name");
  const email = getElementVal("email");
  const mobileNum = getElementVal("mobile-number");
  const password = getElementVal("password");
  const confirmPassword = getElementVal("confirm-password");

  let errors = [];

  try {
      console.log("Checking if email exists...");
      const emailExists = await checkIfEmailExists(email);
      
      if (emailExists) {
          errors.push("This email is already registered.");
      }

      if (mobileNum.length !== 11 || !/^\d{11}$/.test(mobileNum)) {
        errors.push("Invalid mobile number. It must be exactly 11 digits.");
      }

      if (password.length < 16) {
          errors.push("Password must be at least 16 characters long.");
      }

      if (password !== confirmPassword) {
          errors.push("Passwords do not match.");
      }

      if (errors.length > 0) {
          console.log("Validation errors:", errors);
          showErrors(errors);
          toggleLoading(false);
          return;
      }

      console.log("Saving user data...");
      await saveUserData(firstname, lastname, email, mobileNum, password);
      console.log("User data saved successfully.");

      toggleLoading(false);
      showSuccess("Signup successful!");
      signupForm.reset();
      
  } catch (error) {
      console.error("Error during signup:", error);
      showErrors(["Something went wrong. Please try again."]);
      toggleLoading(false);
  }
});

// Function to check if email already exists (with timeout)
const checkIfEmailExists = async (email) => {
  return new Promise((resolve, reject) => {
      const query = usersRef.orderByChild("email").equalTo(email).once("value");

      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
          console.error("Firebase query timeout!");
          reject(new Error("Firebase query timeout"));
      }, 5000);

      query.then(snapshot => {
          clearTimeout(timeout);
          resolve(snapshot.exists());
      }).catch(error => {
          clearTimeout(timeout);
          console.error("Firebase read error:", error);
          reject(error);
      });
  });
};

// Function to save user data to Firebase
const saveUserData = (firstname, lastname, email, mobileNum, password) => {
  return usersRef.push().set({
      firstname,
      lastname,
      email,
      mobile_number: mobileNum,
      password
  });
};

// Helper function to get form input values
const getElementVal = (id) => document.getElementById(id).value.trim();

// Function to display multiple error messages
const showErrors = (messages) => {
  const errorMessageDiv = document.querySelector(".error-message");
  errorMessageDiv.innerHTML = messages.map(msg => `<p>${msg}</p>`).join(""); 
  errorMessageDiv.style.display = "block";
};

// Function to clear error messages
const clearErrors = () => {
  const errorMessageDiv = document.querySelector(".error-message");
  errorMessageDiv.innerHTML = "";
  errorMessageDiv.style.display = "none";
};

// Function to show success messages
const showSuccess = (message) => {
  const successMessage = document.querySelector(".sent-message");
  successMessage.textContent = message;
  successMessage.style.display = "block";
  setTimeout(() => successMessage.style.display = "none", 5000);
};

// Function to show/hide loading indicator
const toggleLoading = (isLoading) => {
  document.querySelector(".loading").style.display = isLoading ? "block" : "none";
};
