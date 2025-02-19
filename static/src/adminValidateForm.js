// create objs
const basSubmit = document.getElementById("basicSubmit");
const updateUser = document.getElementById("updateUser");

/*-----------------VALIDATION BASIC-------------------------*/
// Validate fields for Basic Registration Form
basSubmit.onclick = function() {
  // validate email
  const email = document.getElementById("email").value;

  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);
    return false;
  }

  // validate password
  const pass = document.getElementById("pass").value;

  if (!passIsValid(pass)) {
    alert(`Bad password. Hover over for requirements.`);
    return false;
  }

  // validate first name & last name
  const firstName = document.getElementById("fname").value;
  const lastName = document.getElementById("sname").value;

  if (firstName.length > 0 || lastName.length > 0) {
    if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
      alert("Only letters allowed in name!");
      return false;
    }
  }

  // validate user type
  const type = document.getElementById("type").value;

  if (!typeIsValid(type)) {
    alert("Wrong user type, allowed (admin, vol, org)");
    return false;
  }
}

/*-----------VALIDATION DATA BEFORE UPDATE----------------*/

updateUser.onclick = function () {
  // validate names
  const firstName = document.getElementById("editFname").value;
  const lastName = document.getElementById("editSname").value;

  if (firstName.length > 0 || lastName.length > 0) {
    if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
      alert("Only letters allowed in name!");
      return false;
    }
  }

  // validate pass
  const pass = document.getElementById("editPass").value;

  if (pass) {
    if (!passIsValid(pass)) {
      alert(`Bad password. Hover over for requirements.`);
      return false;
    }
  }

  // validate type
  const type = document.getElementById("editType").value;

  if (!typeIsValid(type)) {
    alert("Wrong user type, allowed (admin, vol, org)");
    return false;
  }

  // validate hours
  const hours = document.getElementById("editHours").value;

  if (isNaN(hours)) {
    alert("Hours per week must be a number between 0 - 168");
    return false;
  }
  else if (hours > 168 || hours < 0) {
    alert("Hours per week must be between 0 - 168");
    return false;
  }

  // validate background check
  const crime = document.getElementById("crime").value;

  if (crime) {
    if (crime !== "yes" && crime !== "no") {
      alert('Background check must be either "yes" or "no"');
      return false;
    }
  }

  // validate resume submitted
  const resume = document.getElementById("resume").value;

  if (resume) {
    if (resume !== "yes" && resume !== "no") {
      alert('Resume submitted must be either "yes" or "no"');
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

// method to validate user type
function typeIsValid(type) {
  switch (type) {
    case 'admin':
    case 'vol':
    case 'org':
      return true;
    default:
      return false;
  }
}