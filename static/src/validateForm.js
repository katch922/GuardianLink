// create obj
const orgSubmit = document.getElementById("orgSubmit");
const volSubmit = document.getElementById("volSubmit");

// validate fields for Org registration form
orgSubmit.onclick = function() {
  // validate email
  const email = document.getElementById("orgEmail").value;

  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);
    location.reload();
    return false;
  }

  // validate passwords
  const pass1 = document.getElementById("orgPass1").value;
  const pass2 = document.getElementById("orgPass2").value;

  if (!passIsValid(pass1) || (!passIsValid(pass2))) {
    alert(`Bad password. Hover over for requirements.`);
    location.reload();
    return false;
  }
  else if (pass1 !== pass2) {
    alert("Passwords do not match");
    location.reload();
    return false;
  }
}

// Validate fields for Volunteer Registration Form
volSubmit.onclick = function() {
  // validate email
  const email = document.getElementById("volEmail").value;

  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);
    location.reload();
    return false;
  }

  // validate password
  const pass1 = document.getElementById("volPass1").value;
  const pass2 = document.getElementById("volPass2").value;

  if (!passIsValid(pass1) || (!passIsValid(pass2))) {
    alert(`Bad password. Hover over for requirements.`);
    return false;
  }
  else if (pass1 !== pass2) {
    alert("Passwords do not match");
    location.reload();
    return false;
  }

  // validate first name & last name
  const firstName = document.getElementById("fname").value;
  const lastName = document.getElementById("sname").value;

  if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
    alert(`Only letters for name`);
    location.reload();
    return false;
  }
}

// method to validation email
function emailIsValid(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (regex.test(email)) {
    return true;
  }
  else {
    return false;
  }
}

// method to validate passwords
function passIsValid(pass) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (regex.test(pass)) {
      return true;
  } else {
      return false;
  }
}

// method to validate name
function nameIsValid(name) {
  const regex = /^[a-zA-Z]{1,19}$/;

  if (regex.test(name)) {
      return true;
  } else {
      return false;
  }
}

// function active() {
//   if(pass1.value.length >= 6){
//     btn.removeAttribute("disabled", "");
//     btn.classList.add("active");
//     pass2.removeAttribute("disabled", "");
//   }else{
//     btn.setAttribute("disabled", "");
//     btn.classList.remove("active");
//     pswrd_2.setAttribute("disabled", "");
//   }
// }
// btn.onclick = function(){
//   if(pass1.value !== pass2.value){
//     errorText.style.display = "block";
//     errorText.classList.remove("matched");
//     errorText.textContent = "Error! Confirm Password Not Match";
//     return false;
//   }else{
//     errorText.style.display = "block";
//     errorText.classList.add("matched");
//     errorText.textContent = "Nice! Confirm Password Matched";
//     return false;
//   }
// }
// function active_2(){
//   if(pass2.value != ""){
//     showBtn.style.display = "block";
//     showBtn.onclick = function(){
//       if((pass1.type == "password") && (pass2.type == "password")){
//         pass1.type = "text";
//         pass1.type = "text";
//         this.textContent = "Hide";
//         this.classList.add("active");
//       }else{
//         pass1.type = "password";
//         pass2.type = "password";
//         this.textContent = "Show";
//         this.classList.remove("active");
//       }
//     }
//   }else{
//     showBtn.style.display = "none";
//   }
// }


// // make the connection
// let url = 'http://localhost:3000/wrongPass';
// xhr.open("POST", url, true);
// xhr.send();
// xhr.responseText = "json";
// xhr.onload = () => {
//   if (xhr.status == 400) {
//     let jsonResponse = JSON.parse(xhr.response);
//     error.textContent = jsonResponse.error;
//   }
//   // if (xhr.readyState == 4 && xhr.status == 200) {
//   //   // get reponse and parse it to a new var
//   //   let jsonResponse = JSON.parse(xhr.response);

//   //   // add to Profile Page elements
//   //   user.textContent = jsonResponse.user;
//   //   firstName.textContent = jsonResponse.firstName;
//   //   lastName.textContent = jsonResponse.lastName;
//   //   email.textContent = jsonResponse.email;
//   // }
//   else {
//     console.log(`"Error:" ${xhr.status}`);
//   }
// };