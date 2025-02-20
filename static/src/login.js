// creaete objects
// User feedback on login screen
const msg = document.querySelector("#msg");
const submit = document.querySelector(".button");

const xhr = new XMLHttpRequest();

submit.onclick = function() {
  // save user input
  const emailInput = document.querySelector("#email").value;
  const passInput = document.querySelector("#password").value;

  // validate inputs
  // validate email
  if (!emailIsValid(emailInput)) {
    alert(`${emailInput} not a valid email`);

    return false;
  }

  // validate password
  if (!passInput) {
    alert('Please enter password');

    return false;
  }

  // Input is good; send data to server
  let url = 'http://localhost:3000/login';
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({'email': emailInput, 'pass': passInput}));
  xhr.responseText = "json";
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 401) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhr.response);

      // add to Profile Page elements
      msg.textContent = jsonResponse.message;
    }
    else if (xhr.readyState == 4 && xhr.status == 200) {
      // redirect to profile page
      window.location.href='/profile';
    }
  };
};


// METHODS for validation
// validate email
function emailIsValid(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (regex.test(email)) {
    return true;
  }
  else {
    return false;
  }
}