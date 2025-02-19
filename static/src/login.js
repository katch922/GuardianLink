// User feedback on login screen
// creaete objects
const msg = document.getElementById("msg");
const submit = document.getElementById("submit");

// create obj
const xhr = new XMLHttpRequest();

submit.onclick = function(req, res) {
  // save user input and send to server
  const emailInput = document.getElementById("email").value;
  const passInput = document.getElementById("password").value;
  // make the connection
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
}