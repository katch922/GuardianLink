// Will populate user info on profile page
// creaete objects
const orgName = document.getElementById("orgName");
const firstName = document.getElementById("fname");
const lastName = document.getElementById("sname");
const email = document.getElementById("email");
const button = document.createElement("button");

// create obj
const xhr = new XMLHttpRequest();

// make the connection
let url = 'http://localhost:3000/profile';
xhr.open("POST", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    // get reponse and parse it to a new var
    let jsonResponse = JSON.parse(xhr.response);
    const type = jsonResponse.type;

    // add to Profile Page elements
    orgName.textContent = jsonResponse.orgName;
    firstName.textContent = jsonResponse.fname;
    lastName.textContent = jsonResponse.sname;
    email.textContent = jsonResponse.email;
    if (type === "admin") {
      // user is admin, add link to open admin page
      //input.type = "button";
      button.className = "button";
      button.textContent = "Admin Tools";
      button.onclick = function() { window.location.href='/admin' };
      document.getElementById("tools").appendChild(button);
    }
    else if (type === 'vol') {
      // use is volunteer, display link for Organization List
      button.className = 'button';
      button.textContent = 'Org List';
      button.onclick = function() { window.location.href='/orgList' };
      document.getElementById("tools").appendChild(button);
    }
    else if (type === 'org') {
      // use is volunteer, display link for Organization List
      button.className = 'button';
      button.textContent = 'Vol List';
      button.onclick = function() { window.location.href='/volList' };
      document.getElementById("tools").appendChild(button);
    }
  }
  else {
    console.log(`"Error:" ${xhr.status}`);
  }
};