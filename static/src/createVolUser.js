// Send data to /createVolUser api using fetch for volunteer registration form
const submit = document.querySelector("#volSubmit");
const notify = document.querySelector("#volNotify");
const form = document.querySelector("#volForm");

submit.onclick = async function() {
  // create a FormData obj with resume if attached
  const formData = new FormData(form);

  const url = '/createVolUser';

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((json) => notify.textContent = json.message)
    .catch((error) => console.log(error));
}