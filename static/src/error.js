// creaete objects
const error = document.querySelector("#error");
const xhr = new XMLHttpRequest();
const button = document.createElement("button");

// Deny Profile page until logged in
let url = 'http://localhost:3000/profile';

//xhr.open("GET", url1, url2, true);
xhr.open("GET", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.status == 401) {
    error.textContent = "Login to view page!";

    button.className = 'button';
    button.textContent = "Login";
    button.onclick = function() { window.location.href='/login' };
    document.querySelector("#login").appendChild(button);
  }
};