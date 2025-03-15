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

firebase.initializeApp(firebaseConfig);

const usersRef = firebase.database().ref("UsersAccount");
const storageRef = firebase.storage().ref("Resumes");
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
  const email = getElementVal("email");
  const mobileNum = getElementVal("mobile-number");
  const password = getElementVal("password");
  const confirmPassword = getElementVal("confirm-password");
  const resumeFile = document.getElementById("resume").files[0];
  const status = "Pending";
  const p_picture = "https://firebasestorage.googleapis.com/v0/b/incuhatchtech-proj.appspot.com/o/Applicant%20Profile%20Pictures%2Fprofile_icon.png?alt=media&token=10ed007b-0192-4966-8b06-6d9eb1bf72ac";
  const user_type = "Applicant";

  let errors = [];

  try {
    if (!resumeFile || resumeFile.type !== "application/pdf") {
      errors.push("Please upload a valid PDF file as your resume.");
    }

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

    const resumeUrl = await uploadResume(uid, resumeFile);
    
    await saveUserData(uid, firstname, lastname, bdate, address, higherLicensed, position, availability, typeOfVessel, experience, resumeUrl, email, mobileNum, status, p_picture, user_type);
    toggleLoading(false);
    showSuccess("Signup successful! Verification email sent.");
    signupForm.reset();
  } catch (error) {
    console.error("Error during signup:", error);
    showErrors([error.message]);
    toggleLoading(false);
  }
});

const uploadResume = (uid, file) => {
  return new Promise((resolve, reject) => {
    const fileRef = storageRef.child(`${uid}.pdf`);
    const uploadTask = fileRef.put(file);

    uploadTask.on("state_changed", 
      (snapshot) => {},
      (error) => reject(error),
      async () => {
        const url = await uploadTask.snapshot.ref.getDownloadURL();
        resolve(url);
      }
    );
  });
};

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
