// Send data to /createVolUser api using fetch for volunteer registration form
const submit = document.querySelector("#volSubmit");
const notify = document.querySelector("#volNotify");

submit.onclick = async function() {
  // save data from web page form
  const firstName = document.querySelector("#fname").value;
  const lastName = document.querySelector("#sname").value;
  const email = document.querySelector("#volEmail").value;
  const form = document.querySelector("#file");
  const pass1 = document.querySelector("#volPass1").value;
  const pass2 = document.querySelector("#volPass2").value;
  const resume = document.querySelector("#resume");

  // api url
  const url = '/createVolUser';

  // validate data
  if (!nameIsValid(firstName) || (!nameIsValid(lastName))) {
    alert("Only letters allowed in name!");

    return false;
  }

  // validate email
  if (!emailIsValid(email)) {
    alert(`${email} not a valid email`);

    return false;
  }

  // validate file type
  if (resume.length > 0) {
    if (!validFileType(file)) {
      alert("FileTypes allowed (.pdf .doc .docx .odt)");

      return false;
    }
  }

  // validate password
  if (!passIsValid(pass1) || (!passIsValid(pass2))) {
    alert(`Bad password. Hover over for requirements.`);

    return false;
  }
  else if (pass1 !== pass2) {
    alert("Passwords do not match");

    return false;
  }

  // data validated, send to server
  // create a FormData obj with file if attached
  const formData = new FormData(form);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((json) => { notify.textContent = json.message })
    .catch((error) => { console.error('Error:', error) });
}


/*-----------------METHODS--------------------------------*/
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
  const regex = /^[a-zA-Z][a-zA-Z]{1,19}$/;

  if (regex.test(name)) {
      return true;
  } else {
      return false;
  }
}

// method to validate files
function validFileType(file) {
  const fileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text"
  ];

  return fileTypes.includes(file.type);
}