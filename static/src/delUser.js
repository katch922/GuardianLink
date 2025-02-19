// Del user account
// create obj
const xhr1 = new XMLHttpRequest();
const delBtn = document.getElementById("delBtn");
const notify = document.getElementById("warn");

delBtn.onclick = function(req, res) {
  // make the connection
  let url = 'http://localhost:3000/delUser';
  xhr1.open("POST", url, true);
  xhr1.send();
  xhr1.responseText = "json";
  xhr1.onload = () => {
    if (xhr1.readyState == 4 && xhr1.status == 400) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhr1.response);

      notify.style["background"] = "#F9627D";
      notify.textContent = jsonResponse.message;
    }
    else if (xhr1.readyState == 4 && xhr1.status == 200) {
      // get reponse and parse it to a new var
      window.location.href='/';
    }
    else {
      console.log(`"Error:" ${xhr1.status}`);
    }
  };
}