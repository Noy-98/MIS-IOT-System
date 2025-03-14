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
  const bdate = getElementVal("b-date");
  const address = getElementVal("address");
  const higherLicensed = getElementVal("higher-licensed");
  const position = getElementVal("select");
  const availability = getElementVal("availability");
  const typeOfVessel = getElementVal("type-of-vessel");
  const experience = getElementVal("experience");
  const resume = getElementVal("resume");
  const email = getElementVal("email");
  const mobileNum = getElementVal("mobile-number");
  const password = getElementVal("password");
  const confirmPassword = getElementVal("confirm-password");
  const status = "Pending";
  const p_picture = "../../uploads/profile_icon.png";
  const user_type = "Applicant";

  let errors = [];

  try {
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
      showErrors(errors);
      toggleLoading(false);
      return;
    }

    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user.sendEmailVerification();
    const uid = userCredential.user.uid;

    await saveUserData(uid, firstname, lastname, bdate, address, higherLicensed, position, availability, typeOfVessel, experience, resume, email, mobileNum, status, p_picture, user_type);
    toggleLoading(false);
    showSuccess("Signup successful! Verification email sent.");
    signupForm.reset();

  } catch (error) {
    console.error("Error during signup:", error);
    showErrors([error.message]);
    toggleLoading(false);
  }
});

const checkIfEmailExists = async (email) => {
  return new Promise((resolve, reject) => {
    const query = usersRef.orderByChild("email").equalTo(email).once("value");
    const timeout = setTimeout(() => {
      reject(new Error("Firebase query timeout"));
    }, 5000);

    query.then(snapshot => {
      clearTimeout(timeout);
      resolve(snapshot.exists());
    }).catch(error => {
      clearTimeout(timeout);
      reject(error);
    });
  });
};

const saveUserData = (uid, firstname, lastname, bdate, address, higherLicensed, position, availability, typeOfVessel, experience, resume, email, mobileNum, status, p_picture, user_type) => {
  return usersRef.child(uid).set({
    firstname,
    lastname,
    bdate,
    address,
    higherLicensed,
    position,
    availability,
    typeOfVessel,
    experience,
    resume,
    email,
    mobile_number: mobileNum,
    status,
    p_picture,
    user_type
  });
};

const getElementVal = (id) => document.getElementById(id).value.trim();

const showErrors = (messages) => {
  const errorMessageDiv = document.querySelector(".error-message");
  errorMessageDiv.innerHTML = messages.map(msg => `<p>${msg}</p>`).join("");
  errorMessageDiv.style.display = "block";
};

const clearErrors = () => {
  const errorMessageDiv = document.querySelector(".error-message");
  errorMessageDiv.innerHTML = "";
  errorMessageDiv.style.display = "none";
};

const showSuccess = (message) => {
  const successMessage = document.querySelector(".sent-message");
  successMessage.textContent = message;
  successMessage.style.display = "block";
  setTimeout(() => successMessage.style.display = "none", 5000);
};

const toggleLoading = (isLoading) => {
  document.querySelector(".loading").style.display = isLoading ? "block" : "none";
};
