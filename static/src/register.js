// submit buttons to watch for & feedback to user
const orgSub = document.querySelector("#orgSubmit");
const orgNotify = document.querySelector("#orgNotify");

// create obj
const xhr = new XMLHttpRequest();

orgSub.onclick = function() {
  // save registration form data
  const orgName = document.querySelector("#orgName").value;
  const orgEmail = document.querySelector("#orgEmail").value;
  const concern = document.querySelector("#concern").value;
  const orgPass1 = document.querySelector("#orgPass1").value;
  const orgPass2 = document.querySelector("#orgPass2").value;

  // VALIDATE
  // validate name; cannot be empty
  if (!orgName) {
    alert('Organization Name cannot be empty');

    return false;
  }

  // validate email
  if (!emailIsValid(orgEmail)) {
    alert(`${orgEmail} not a valid email`);

    return false;
  }

  // validate concerns; cannot be empty
  if (!concern) {
    alert('Write your concerns, cannot be empty');

    return false;
  }

  // validate pass
  if (!passIsValid(orgPass1) || (!passIsValid(orgPass2))) {
    alert("Bad password. Hover over for requirements.");

    return false;
  }
  else if (orgPass1 !== orgPass2) {
    alert("Passwords do not match");

    return false;
  }

  // make the connection
  let url = 'http://localhost:3000/createOrgUser';
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ 'orgName': orgName, 'orgEmail': orgEmail, 'concern': concern,
    'orgPass1': orgPass1 }));
  xhr.responseText = "json";
  xhr.onload = () => {
    if (xhr.readyState === 4 && xhr.status === 409) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhr.response);

      // display notification to user
      orgNotify.textContent = jsonResponse.message;
    }
    else if (xhr.readyState === 4 && xhr.status === 201) {
      const jsonResponse = JSON.parse(xhr.response);

      // show user success message
      orgNotify.textContent = jsonResponse.message;
    }
  };
};


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