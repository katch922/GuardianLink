// Del own user account
// create obj
const delBtn = document.querySelector("#delBtn");
const notify = document.querySelector("#warn");

delBtn.onclick = function() {
  const xhr = new XMLHttpRequest();

  // make the connection
  let url = 'http://localhost:3000/delUser';
  xhr.open("POST", url, true);
  xhr.send();
  xhr.responseText = "json";
  xhr.onload = () => {
    if (xhr.readyState === 4 && xhr.status === 400) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhr.response);

      notify.style["background"] = "#F9627D";
      notify.textContent = jsonResponse.message;
    }
    else if (xhr.readyState === 4 && xhr.status === 200) {
      // get reponse and parse it to a new var
      window.location.href='/';
    }
    else {
      console.log(`"Error:" ${xhr.status}`);
    }
  };
}