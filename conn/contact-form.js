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

var contactFormDB = firebase.database().ref("ContactForm");

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  // Show loading message
  document.querySelector(".loading").style.display = "block";

  var name = getElementVal("name");
  var emailid = getElementVal("email");
  var subject = getElementVal("subject");
  var message = getElementVal("message");

  saveMessages(name, emailid, subject, message).then(() => {
      // Hide loading message
      document.querySelector(".loading").style.display = "none";

      // Show success message
      document.querySelector(".sent-message").style.display = "block";

      // Hide success message after 3 seconds
      setTimeout(() => {
          document.querySelector(".sent-message").style.display = "none";
      }, 3000);

      // Reset the form
      document.getElementById("contactForm").reset();
  }).catch((error) => {
      // Hide loading message
      document.querySelector(".loading").style.display = "none";

      // Show error message
      document.querySelector(".error-message").innerText = "Something went wrong. Please try again.";
      document.querySelector(".error-message").style.display = "block";
  });
}

const saveMessages = (name, emailid, subject, message) => {
  var newContactForm = contactFormDB.push();
  return newContactForm.set({
      name: name,
      emailid: emailid,
      subject: subject,
      message: message,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
