// create obj
const orgSubmit = document.getElementById("orgSubmit");
const volSubmit = document.getElementById("volSubmit");

/*-----------------VALIDATION ORG-------------------------*/
// validate fields for Org registration form
orgSubmit.onclick = function() {
  // validate email
  const email = document.getElementById("orgEmail").value;

  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);
    location.reload();
    return false;
  }

  // validate passwords
  const pass1 = document.getElementById("orgPass1").value;
  const pass2 = document.getElementById("orgPass2").value;

  if (!passIsValid(pass1) || (!passIsValid(pass2))) {
    alert(`Bad password. Hover over for requirements.`);
    location.reload();
    return false;
  }
  else if (pass1 !== pass2) {
    alert("Passwords do not match");
    location.reload();
    return false;
  }
}

/*-----------------VALIDATION VOL-------------------------*/
// Validate fields for Volunteer Registration Form
volSubmit.onclick = function() {
  // validate email
  const email = document.getElementById("volEmail").value;

  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);
    location.reload();
    return false;
  }

  // validate password
  const pass1 = document.getElementById("volPass1").value;
  const pass2 = document.getElementById("volPass2").value;

  if (!passIsValid(pass1) || (!passIsValid(pass2))) {
    alert(`Bad password. Hover over for requirements.`);
    return false;
  }
  else if (pass1 !== pass2) {
    alert("Passwords do not match");
    //location.reload();
    return false;
  }

  // validate first name & last name
  const firstName = document.getElementById("fname").value;
  const lastName = document.getElementById("sname").value;

  if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
    alert("Only letters allowed in name!");
    location.reload();
    return false;
  }

  // validate file type
  const file = document.getElementById("resume");

  if (file.length > 0) {
    if (!validFileType(file)) {
      alert("FileTypes allowed (.pdf .doc .docx .odt)");
      location.reload();
      return false;
    }
  }
}

/*-----------------METHODS--------------------------------*/
// method to validation email
function emailIsValid(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (regex.test(email)) {
    return true;
  }
  else {
    return false;
  }
}

// method to validate passwords
function passIsValid(pass) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (regex.test(pass)) {
      return true;
  } else {
      return false;
  }
}

// method to validate name
function nameIsValid(name) {
  const regex = /^[a-zA-Z][a-zA-Z]{1,19}$/;

  if (regex.test(name)) {
      return true;
  } else {
      return false;
  }
}

// method to validate files
function validFileType(file) {
  const fileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text"
  ];

  return fileTypes.includes(file.type);
}
