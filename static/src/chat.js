// populate chat messages
// make the connection
const xhr = new XMLHttpRequest();

// make the connection
const url = 'http://localhost:3000/chat';

xhr.open("POST", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    // get reponse and parse it to a new var
    const jsonResponse = JSON.parse(xhr.response);

    const table = document.querySelector('table');

    // display all messages from user; allow to delete messages
    for (let i = 0; i < jsonResponse.length; i++) {
      // create a new row
      let tr = table.insertRow();
      for (let j = 0; j < 1; j++) {
        // populate with messages
        var email = tr.insertCell();
        email.innerHTML = jsonResponse[i].email_from;
        var msg = tr.insertCell();
        msg.innerHTML = jsonResponse[i].message;
        // set right margin to 0
        msg.style["padding-right"] = "0";

        // first row no padding on top
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