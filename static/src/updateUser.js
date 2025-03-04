// create objs
const updateUser = document.querySelector("#updateBtn");
const xhr3 = new XMLHttpRequest();

/*-----------VALIDATION DATA BEFORE UPDATE----------------*/
updateUser.onclick = function () {
  // all user input data
  const firstName = document.querySelector("#fname").value;
  const lastName = document.querySelector("#sname").value;
  const email = document.querySelector("#email").value;
  const hours = document.querySelector("#hours").value;
  const orgName = document.querySelector("#orgName").value;
  const info = document.querySelector("#info").value;
  const pass = document.querySelector("#pass").value;
  const type = document.querySelector("#type").value;

  // validate names
  if (firstName.length > 0 || lastName.length > 0) {
    if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
      alert("Only letters allowed in name!");

      return false;
    }
  }

  // validate pass
  if (pass) {
    if (!passIsValid(pass)) {
      alert(`Bad password. Hover over for requirements.`);

      return false;
    }
  }

  // validate email
  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);

    return false;
  }

  // validate hours
  if (type === 'vol' && (!hours)) {
    alert("Hours per week must be a number between 0 - 168");

    return false;
  }
  else if (hours > 168 || hours < 0) {
    alert("Hours per week must be between 0 - 168");

    return false;
  }
  else if (isNaN(hours)) {
    alert(`${hours} is not a valid number.`);

    return false;
  }

  // validate Organization Name for org users
  if (type === 'org' && (!orgName)) {
    alert("Organization name cannot be empty.");

    return false;
  }

  // user validated; send data to server
  const url = 'http://localhost:3000/updateUser';
  xhr3.open("POST", url, true);
  xhr3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr3.send(JSON.stringify({
    'fname': firstName, 'sname': lastName, 'email': email, 'hours': hours,
    'orgName': orgName, 'info': info, 'pass': pass
  }));
  xhr3.responseText = "json";
  xhr3.onload = () => {
    if (xhr3.readyState === 4 && xhr3.status === 200) {
      // get reponse and parse it to a new var
      let jsonResponse = JSON.parse(xhr3.response);

      document.querySelector("#feedback").textContent = jsonResponse.message;
    }
    else {
      console.log(`"Error:" ${xhr.status}`);
    }
  };
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