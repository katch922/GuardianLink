// populate org list
// make the connection
const xhr = new XMLHttpRequest();

// make the connection
const url = 'http://localhost:3000/volList';

xhr.open("POST", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    // get reponse and parse it to a new var
    const jsonResponse = JSON.parse(xhr.response);

    const table = document.querySelector('table');

    // for the amount of organizations; display data to volunteers
    for (let i = 0; i < jsonResponse.length; i++) {
      // create a new row
      let tr = table.insertRow();
      for (let j = 0; j < 1; j++) {
        // populate the data
        var fname = tr.insertCell();
        fname.innerHTML = jsonResponse[i].forename;
        var lname = tr.insertCell();
        lname.innerHTML = jsonResponse[i].surname;
        var email = tr.insertCell();
        email.innerHTML = jsonResponse[i].email;
        var hours = tr.insertCell();
        hours.innerHTML = jsonResponse[i].available;
        // set right margin to 0
        hours.style["padding-right"] = "0";
        //hours.style["width"] = "60%";
        if (i === 0) {
          fname.style["padding-top"] = '25px';
          lname.style["padding-top"] = '25px';
          email.style["padding-top"] = '25px';
          hours.style["padding-top"] = '25px';
        }
      }
    }
  }
  else {
    console.log(`"Error:" ${xhr.status}`);
  }
};