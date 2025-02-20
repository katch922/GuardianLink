// populate org list
// make the connection
const xhr = new XMLHttpRequest();

// make the connection
const url = 'http://localhost:3000/orgList';

xhr.open("POST", url, true);
xhr.send();
xhr.responseText = "json";
xhr.onload = () => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // get reponse and parse it to a new var
    const jsonResponse = JSON.parse(xhr.response);

    const table = document.querySelector('#list');

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

        // create button for contact
        var btn = tr.insertCell();
        let msgBtn = document.createElement('button');
        msgBtn.className = 'button';
        // set id to email address so we can use for messaging
        msgBtn.id = `${jsonResponse[i].email}`;
        msgBtn.setAttribute("name", "contactBtn");
        msgBtn.textContent = 'Contact';
        btn.appendChild(msgBtn);
      }
    }
  }
  else {
    console.log(`"Error:" ${xhr.status}`);
  }

  // get all contact buttons and add to array
  const contacts = document.querySelectorAll("[name='contactBtn']");
  const contactArray = Array.from(contacts);
  let email;

  contactArray.forEach(contact => {
    contact.onclick = async function() {
      email = contact.id;

      // set email we will be emailing to
      const emailLabel = document.querySelector('label');
      const msgTextarea = document.querySelector('textarea');

      // set some values on them
      emailLabel.setAttribute("for", `${email}`);
      msgTextarea.id = email;
      emailLabel.textContent = email;
    }
  });
};

// will be waiting for message to be sent
const sendMsg = document.querySelector("#sendMsg");
const xhrMsg = new XMLHttpRequest();


sendMsg.onclick = function() {
  const url = 'http://localhost:3000/sendMsg';
  const textarea = document.querySelector('textarea').value;
  const email = document.querySelector('textarea').id;
  const feedback = document.querySelector('#error');

  // send data to server
  xhrMsg.open("POST", url, true);
  xhrMsg.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhrMsg.send(JSON.stringify({'email': email, 'msg': textarea}));
  xhrMsg.responseText = "json";
  xhrMsg.onload = () => {
    if (xhrMsg.readyState === 4 && xhrMsg.status === 201) {
      // get reponse and parse it to a new var
      const jsonResponse = JSON.parse(xhrMsg.response);

      // let user know message was sent
      feedback.textContent = jsonResponse.message;
    }
    else if (xhrMsg.readyState === 4 && xhrMsg.status === 400) {
      const jsonResponse = JSON.parse(xhrMsg.response);

      // let user know the error
      feedback.textContent = jsonResponse.message;
    }
  };
}

// populate messages on the page
const xhrGetMsg = new XMLHttpRequest();
const urlGetMsg = 'http://localhost:3000/fetchMsg';

xhrGetMsg.open("POST", urlGetMsg, true);
xhrGetMsg.send();
xhrGetMsg.responseText = "json";
xhrGetMsg.onreadystatechange = () => {
  if (xhrGetMsg.readyState === 4 && xhrGetMsg.status === 200) {
    const jsonRes = JSON.parse(xhrGetMsg.response);
    const table = document.querySelector('#messages');

    // display all user messages
    for (let i = 0; i < jsonRes.length; i++) {
      // create a new row
      let tr = table.insertRow();

      for (let j = 0; j < 1; j++) {
        // populate the data
        var emailFrom = tr.insertCell();
        emailFrom.innerHTML = jsonRes[i].email_from;
        var msg = tr.insertCell();
        msg.innerHTML = jsonRes[i].message;

        // create button for reply
        var replyRow = tr.insertCell();
        let replyBtn = document.createElement('button');
        replyBtn.className = 'button';
        // set id to email address so we can use for messaging
        replyBtn.id = `${jsonRes[i].email_from}`;
        replyBtn.setAttribute("name", "replyBtn");
        replyBtn.textContent = 'Reply';
        replyRow.appendChild(replyBtn);

        // create button for delete
        var delBtn = document.createElement('button');
        delBtn.className = 'button';
        // set id to id number of the msg so we can use for deleting
        delBtn.id = `${jsonRes[i].id}`;
        delBtn.setAttribute("name", "delBtn");
        delBtn.textContent = 'Delete';
        replyRow.appendChild(delBtn);
      }
    }
  }

  // get all contact buttons and add to array
  const contacts = document.querySelectorAll("[name='replyBtn']");
  const contactArray = Array.from(contacts);
  let email;

  contactArray.forEach(contact => {
    contact.onclick = async function() {
      email = contact.id;

      // set email we will be emailing to
      const emailLabel = document.querySelector('label');
      const msgTextarea = document.querySelector('textarea');

      // set some values on them
      emailLabel.setAttribute("for", `${email}`);
      msgTextarea.id = email;
      emailLabel.textContent = email;
    }
  });

  // allow user to delete messages
  // get all contact buttons and add to array
  const message = document.querySelectorAll("[name='delBtn']");
  const messageArray = Array.from(message);
  const delMsgNotify = document.querySelector("#delMsgNotify");
  let msgToDel;

  messageArray.forEach(message => {
    message.onclick = async function() {
      // this is the message to be deleted
      msgToDel = message.id;

      const xhr = new XMLHttpRequest();
      const url = 'http://localhost:3000/delMsg';

      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify({ 'msgToDel': msgToDel }));
      xhr.responseText = "json";
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          // get reponse and parse it to a new var
          const jsonRes = JSON.parse(xhr.response);

          // let user know message was sent
          delMsgNotify.textContent = jsonRes.message;
          // reload page to remove deleted msg from list
          location.reload();
        }
        else if (xhr.readyState === 4 && xhr.status === 400) {
          const jsonRes = JSON.parse(xhr.response);

          delMsgNotify.textContent = jsonRes.message;
        }
      };
    }
  });
};