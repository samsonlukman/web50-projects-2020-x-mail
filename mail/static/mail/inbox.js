document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener('submit', send_email);
  document.querySelector('#submit').addEventListener('click', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// send email and set interval before the default function runs
function send_email(event) {
  event.preventDefault(); 
    let recipient = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipient,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result)
    });
  }
  // set interval for compose form
 function submit_email() {
  setTimeout(function() {
    load_mailbox('sent');
  }, 1000);
  
 }


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
 
}
 // view email content
function emailView(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Show email details and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content').style.display = 'block';

    document.querySelector("#email-content").innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
      <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
      <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
      <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
      <li class="list-group-item">${email.body}</li>
    </ul>
    `

    // mark email has read using the API

    if(!email.read) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    // create reply button
    const replyButton = document.createElement('button');
    replyButton.innerHTML = "Reply";
    replyButton.className = "btn btn-secondary";
    replyButton.addEventListener('click', function() {
    compose_email();
    document.querySelector("#compose-recipients").value = email.sender;
    document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
    document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;
  })

  document.querySelector("#email-content").append(replyButton);

    // create archive button
    const archiveButton = document.createElement('button');
    archiveButton.innerHTML = email.archived ? "unarchive" : "archive";
    archiveButton.className = email.archived ? "btn btn-success" : "btn btn-danger";
    
    
    // on clicking archive, it sets to opposite value
    archiveButton.addEventListener('click', function() {
      email.archived = !email.archived;
      archiveButton.innerHTML = email.archived ? "unarchive" : "archive";
      archiveButton.className = email.archived ? "btn btn-success" : "btn btn-danger";
      
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: email.archived
        })
      })
    })
    // insert button in email
    document.querySelector("#email-content").appendChild(archiveButton);
  });
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails for the selected mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print the emails
    console.log(emails);

    // Add the emails to the mailbox view
    let emailList = document.createElement('ul');
    emailList.className = 'list-group';
    emails.forEach(email => {
      let emailItem = document.createElement('li');
      emailItem.className = 'list-group-item';
      if (!email.read) {
        emailItem.style.backgroundColor = 'white';
      } else {
        emailItem.style.backgroundColor = 'gray';
      }

      emailItem.innerHTML = `
        <span class="sender">${email.sender}</span>
        <span class="subject">${email.subject}</span>
        <span class="timestamp">${email.timestamp}</span>
      `;

      // Add event listener to open email on click
      emailItem.addEventListener('click', function() {
        emailView(email.id);
      });

      emailList.appendChild(emailItem);
    });
    document.querySelector('#emails-view').appendChild(emailList);
  });
}

