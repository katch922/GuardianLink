// create obj for the call
const xhr = new XMLHttpRequest();
const submit = document.querySelector(".button");
const notify = document.querySelector("#status");

submit.onclick = function() {
  // link for the server api
  const url = 'http://localhost:3000/contact';
  // values to be sent to the server
  const email = document.querySelector("#email").value;
  const msg = document.querySelector("#info").value;

  // validate user input before sending to server
  // validate email
  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);

    return false;
  }

  // validate msg; cannot be empty
  if (!msg) {
    alert(`Message cannot be empty`);

    return false;
  }

  // data is valid, send to server
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ 'name': name, 'email': email, 'msg': msg }));
  xhr.responseText = "json";
  xhr.onload = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // save the response from server
      const jsonRes = JSON.parse(xhr.response);

      // give feedback to user
      notify.textContent = jsonRes.msg;
    }
    else {
      console.log(`Error: ${xhr.readyState}`);
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