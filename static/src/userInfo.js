// Will populate user info on profile page
// creaete objects
const orgName = document.getElementById("orgName");
const firstName = document.getElementById("fname");
const lastName = document.getElementById("sname");
const email = document.getElementById("email");

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

    // add to Profile Page elements
    orgName.textContent = jsonResponse.orgName;
    firstName.textContent = jsonResponse.fname;
    lastName.textContent = jsonResponse.sname;
    email.textContent = jsonResponse.email;
    
  }
  else {
    console.log(`"Error:" ${xhr.status}`);
  }
};