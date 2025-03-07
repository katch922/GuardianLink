// Will populate user info on profile page
// creaete objects
const orgName = document.querySelector("#orgName");
const firstName = document.querySelector("#fname");
const lastName = document.querySelector("#sname");
const email = document.querySelector("#email");
const button = document.createElement("button");
const hours = document.querySelector("#hours");
const orgInfo = document.querySelector("#info");
const typeInput = document.querySelector('#type');

// create obj
const xhr = new XMLHttpRequest();

// make the connection
const url = 'http://localhost:3000/profile';
xhr.open("POST", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onreadystatechange = () => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // get reponse and parse it to a new var
    let jsonResponse = JSON.parse(xhr.response);
    const type = jsonResponse.type;

    // add to Profile Page elements
    orgName.value = jsonResponse.orgName;
    firstName.value = jsonResponse.fname;
    lastName.value = jsonResponse.sname;
    email.value = jsonResponse.email;
    hours.value = jsonResponse.hours;
    orgInfo.value = jsonResponse.info;
    typeInput.value = jsonResponse.type;

    // based on user type add a button
    if (type === "admin") {
      // user is admin, add link to open admin page
      button.className = "button";
      button.textContent = "Admin Tools";
      button.onclick = function() { window.location.href='/admin' };
      document.querySelector("#tools").appendChild(button);

      // disable certain fields
      hours.disabled = true;
      orgName.disabled = true;
      orgInfo.disabled = true;
    }
    else if (type === 'vol') {
      // use is volunteer, display link for Organization List
      button.className = 'button';
      button.textContent = 'ORG LIST';
      button.onclick = function() { window.location.href='/orgList' };
      document.querySelector("#tools").appendChild(button);

      // disable certain input fields
      orgName.disabled = true;
      orgInfo.disabled = true;
    }
    else if (type === 'org') {
      // use is volunteer, display link for Organization List
      button.className = 'button';
      button.textContent = 'VOL LIST';
      button.onclick = function() { window.location.href='/volList' };
      document.querySelector("#tools").appendChild(button);

      // disable volunteer input fields
      firstName.disabled = true;
      lastName.disabled = true;
      hours.disabled = true;
    }
  }
};