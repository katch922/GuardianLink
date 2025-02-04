// populate org list
// create obj
const xhr = new XMLHttpRequest();

// make the connection
let url = 'http://localhost:3000/orgList';
xhr.open("POST", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    // get reponse and parse it to a new var
    const jsonResponse = JSON.parse(xhr.response);

    
  }
  else {
    console.log(`"Error:" ${xhr.status}`);
  }
};

// // clear screen to display new user info
// let counter = 0;
// userList.onmousemove = function (req, res) {
//   if (counter > 0) {
//     location.reload(true);
//   }
// }

// // When user selects a user, fetch user info
// userList.onclick = function(req, res) {
//   const fetchUser = userList.value;
//   xhr.open("POST", url, true);
//   //xhr.setRequestHeader('email', fetchUser);
//   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   xhr.send(JSON.stringify({'email': fetchUser}));
//   xhr.onload = () => {
//     if (xhr.readyState == 4 && xhr.status == 200) {
//       const jsonResponse = JSON.parse(xhr.response);
//       const orgName = document.getElementById("editName");
//       const firstName = document.getElementById("editFname");
//       const lastName = document.getElementById("editSname");
//       const type = document.getElementById("editType");
//       const info = document.getElementById("editInfo");
//       const hours = document.getElementById("editHours");
//       const crime = document.getElementById("crime");
//       const resume = document.getElementById("resume");
//       const email = document.getElementById("hiddenEmail");

//       if (counter > 0) {
//         refreshData();
//       }

//       // populate page
//       orgName.value = jsonResponse[0].org_name;
//       firstName.value = jsonResponse[0].forename;
//       lastName.value = jsonResponse[0].surname;
//       type.value = jsonResponse[0].user_type;
//       info.value = jsonResponse[0].concerns;
//       hours.value = jsonResponse[0].available;
//       crime.value = jsonResponse[0].background_check;
//       resume.value = jsonResponse[0].resume;
//       email.value = jsonResponse[0].email;

//       counter++;
//     }
//     else {
//       console.log(`"Error: ${xhr.status}`);
//     }
//   }
// }