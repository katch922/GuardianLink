// creaete objects
const error = document.getElementById("error");
const xhr = new XMLHttpRequest();

// Deny Profile page until logged in
let url = 'http://localhost:3000/profile';

xhr.open("GET", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.status == 401) {
    error.textContent = "Login to view page!";
  }
};