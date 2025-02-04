// submit buttons to watch for
const orgSub = document.getElementById("orgSubmit");
const orgNotify = document.getElementById("orgNotify");

// create obj
const xhr = new XMLHttpRequest();

orgSub.onclick = function(req, res) {
  // save registration form and send to server
  const orgName = document.getElementById("orgName").value;
  const orgEmail = document.getElementById("orgEmail").value;
  const concern = document.getElementById("concern").value;
  const orgPass = document.getElementById("orgPass1").value;

  // make the connection
  let url = 'http://localhost:3000/createOrgUser';
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ 'orgName': orgName, 'orgEmail': orgEmail, 'concern': concern,
    'orgPass1': orgPass }));
  xhr.responseText = "json";
  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 409) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhr.response);

      // display notification to user
      orgNotify.textContent = jsonResponse.message;
    }
    else if (xhr.readyState == 4 && xhr.status == 201) {
      const jsonResponse = JSON.parse(xhr.response);

      // show user success message
      orgNotify.textContent = jsonResponse.message;
    }
  };
}