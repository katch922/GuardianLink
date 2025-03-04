// submit buttons to watch for
const submit = document.querySelector("#basicSubmit");
const notify = document.querySelector("#notify");

submit.onclick = function(req, res) {
  // create obj
  const xhr = new XMLHttpRequest();

  // save registration form and send to server
  const firstName = document.querySelector("#fname").value;
  const lastName = document.querySelector("#sname").value;
  const orgName = document.querySelector("#orgName").value;
  const email = document.querySelector("#email").value;
  const pass = document.querySelector("#pass").value;
  const type = document.querySelector("#type").value;

  // VALIDATE DATA
  // validate names
  if (firstName.length > 0 || lastName.length > 0) {
    if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
      alert("Only letters allowed in name!");

      return false;
    }
  }

  // validate email
  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);

    return false;
  }

  // validate pass
  if (pass) {
    if (!passIsValid(pass)) {
      alert(`Bad password. Hover over for requirements.`);

      return false;
    }
  }
  else if(!pass) {
    alert(`Must set a password.`);

    return false;
  }

  // validate user type
  if (type != 'admin' && type != 'vol' && type != 'org') {
    alert(`${type} is not a proper user type. Valid user types 'admin' 'vol' 'org'`);

    return false;
  }

  // user validated send data to server
  // make the connection
  let url = 'http://localhost:3000/createBasicUser';
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ 'fname': firstName, 'sname': lastName,
    'orgName': orgName, 'email': email, 'pass': pass, 'type': type }));
  xhr.responseText = "json";
  xhr.onload = () => {
    if (xhr.readyState === 4 && xhr.status === 409) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhr.response);

      // display notification to user
      notify.textContent = jsonResponse.message;
    }
    else if (xhr.readyState === 4 && xhr.status === 201) {
      const jsonResponse = JSON.parse(xhr.response);

      // show user success message
      notify.textContent = jsonResponse.message;
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