// Will be used for Volunteer Registration; Will allow to select Available Hours Per Week
// Which is from 0 to 168 hours max
const hours = document.querySelector('#hours');

for (let i = 0; i < 169; i++) {
  const option = document.createElement('option');
  option.value = i;
  option.innerHTML = i;
  hours.appendChild(option);
}