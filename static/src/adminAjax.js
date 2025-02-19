// submit buttons to watch for
const submit = document.getElementById("basicSubmit");
const notify = document.getElementById("notify");

// create obj
const xhrCreate = new XMLHttpRequest();

submit.onclick = function(req, res) {
  // save registration form and send to server
  const firstName = document.getElementById("fname").value;
  const lastName = document.getElementById("sname").value;
  const orgName = document.getElementById("orgName").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("pass").value;
  const type = document.getElementById("type").value;

  // make the connection
  let url = 'http://localhost:3000/createBasicUser';
  xhrCreate.open("POST", url, true);
  xhrCreate.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhrCreate.send(JSON.stringify({ 'fname': firstName, 'sname': lastName,
    'orgName': orgName, 'email': email, 'pass': pass, 'type': type }));
  xhrCreate.responseText = "json";
  xhrCreate.onload = () => {
    if (xhrCreate.readyState == 4 && xhrCreate.status == 409) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhrCreate.response);

      // display notification to user
      notify.textContent = jsonResponse.message;
    }
    else if (xhrCreate.readyState == 4 && xhrCreate.status == 201) {
      const jsonResponse = JSON.parse(xhrCreate.response);

      // show user success message
      notify.textContent = jsonResponse.message;
    }
  };
}