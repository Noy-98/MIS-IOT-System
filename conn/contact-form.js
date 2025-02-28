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

  var contactFormDB = firebase.database().ref("ContactForm");

  document.getElementById("contactForm").addEventListener("submit", submitForm);

  function submitForm(e) {
    e.preventDefault();
  
    var name = getElementVal("name");
    var emailid = getElementVal("email");
    var subject = getElementVal("subject");
    var message = getElementVal("message");
  
    saveMessages(name, emailid, subject, message);
  
    //   enable alert
    document.querySelector(".sent-message").style.display = "block";
  
    //   remove the alert
    setTimeout(() => {
      document.querySelector(".sent-message").style.display = "none";
    }, 3000);
  
    //   reset the form
    document.getElementById("contactForm").reset();
  }
  
  const saveMessages = (name, emailid, subject, message) => {
    var newContactForm = contactFormDB.push();
  
    newContactForm.set({
      name: name,
      emailid: emailid,
      subject: subject,
      message: message,
    });
  };
  
  const getElementVal = (id) => {
    return document.getElementById(id).value;
  };