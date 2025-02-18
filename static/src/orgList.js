// populate org list
// make the connection
const xhr = new XMLHttpRequest();

// make the connection
const url = 'http://localhost:3000/orgList';

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
        var x = tr.insertCell();
        x.innerHTML = jsonResponse[i].org_name;
        var y = tr.insertCell();
        y.innerHTML = jsonResponse[i].email;
        var z = tr.insertCell();
        z.innerHTML = jsonResponse[i].concerns;
        // set right margin to 0
        z.style["padding-right"] = "0";
        z.style["width"] = "33%";
        if (i === 0) {
          x.style["padding-top"] = '25px';
          y.style["padding-top"] = '25px';
          z.style["padding-top"] = '25px';
        }
        var btn = tr.insertCell();
        let aTag = document.createElement('a');
        aTag.href = `mailto:${jsonResponse[i].email}`;
        aTag.innerHTML = 'Send Email';
        btn.appendChild(aTag);
      }
    }
  }
  else {
    console.log(`"Error:" ${xhr.status}`);
  }
};