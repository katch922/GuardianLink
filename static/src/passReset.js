// create obj
const submit = document.querySelector(".button");
const err = document.querySelector("#error");

submit.onclick = function(req, res) {
  const xhr = new XMLHttpRequest();
  const email = document.querySelector("#email").value;

  console.log(email);
  // validate email
  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);

    return false;
  }

  // email is valid send data
  const url = 'http://localhost:3000/passReset';

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ 'email': email }));
  xhr.responseText = "json";
  xhr.onload = () => {
    const jsonResponse = JSON.parse(xhr.response);

    if (xhr.readyState === 4 && xhr.status === 200) {
      // user found, send email for reset
      err.textContent = jsonResponse.message;
    }
    else if (xhr.readyState === 4 && xhr.status === 404) {
      // email does not exists
      err.textContent = jsonResponse.message;
    }
    else if (xhr.readyState === 4 && xhr.status === 400) {
      // reset already sent, do not send again
      err.textContent = jsonResponse.message;
    }
    else {
      console.log(`"Error:" ${xhr.status}`);
    }
  }
};


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