// make the connection
const xhrMsg = new XMLHttpRequest();

// make the connection
const url1 = 'http://localhost:3000/fetchMsg';

xhrMsg.open("POST", url1, true);
xhrMsg.send();
xhrMsg.responseText = "json";
xhrMsg.onreadystatechange = () => {
  if (xhrMsg.readyState === 4 && xhrMsg.status === 200) {
    const jsonRes = JSON.parse(xhrMsg.response);
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

        // create button for reset
        var resetRow = tr.insertCell();
        let resetBtn = document.createElement('a');
        resetBtn.className = 'button';
        // set id to email address so we can use for messaging
        resetBtn.id = `${jsonRes[i].email_from}`;
        resetBtn.setAttribute("href", `mailto:${jsonRes[i].email_from}`);
        resetBtn.textContent = 'Reset';
        resetRow.appendChild(resetBtn);

        // create button for delete
        var delBtn = document.createElement('button');
        delBtn.className = 'button';
        // set id to id number of the msg so we can use for deleting
        delBtn.id = `${jsonRes[i].id}`;
        delBtn.setAttribute("name", "delBtn");
        delBtn.textContent = 'Delete';
        resetRow.appendChild(delBtn);
      }
    }
  }

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
      const url2 = 'http://localhost:3000/delMsg';

      xhr.open("POST", url2, true);
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