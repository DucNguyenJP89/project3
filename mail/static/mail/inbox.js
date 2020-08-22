document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Add event when submit form
  document.querySelector('#compose-form').addEventListener('submit', function() {
    
    //Get information from form input
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send email to recipients
    fetch('emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result.status === 400) {
        compose_email();
        console.log("Error: " + result.status);
      }
      load_mailbox('sent');
    })


  });

};

function load_mailbox(mailbox) {

  //Get emails and add email to mailbox
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => { 
      if (emails.length === 0) {
        
        //Create mailbox with message
        const noMail = document.createElement('div');
        noMail.className = 'no-mail';
        noMail.innerHTML = 'This mailbox is currently empty.'

        //Add to view
        document.querySelector('#emails-view').append(noMail);
      } else {
        emails.forEach(add_email);
      }
      
  })

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

};

function add_email(email) {

  //Create new email with subject, sender, timestamp
  const newEmail = document.createElement('div');
  newEmail.className = 'email';
  if (email.read === true) {
    newEmail.style.backgroundColor = 'grey';
  } else {
    newEmail.style.backgroundColor = 'white';
  }
  const newSubject = document.createElement('h5');
  newSubject.className = 'subject';
  newSubject.innerHTML = `Subject: ${email.subject}`;
  const newSender = document.createElement('p');
  newSender.className = 'sender';
  newSender.innerHTML = `Sender: ${email.sender}`;
  const newRecipients = document.createElement('p');
  newRecipients.className = 'recipient';
  newRecipients.innerHTML = `To: ${email.recipients}`;
  const newTime = document.createElement('p');
  newTime.className = 'timestamp';
  newTime.innerHTML = `${email.timestamp}`;

  newEmail.appendChild(newSubject);
  newEmail.appendChild(newSender);
  newEmail.appendChild(newRecipients);
  newEmail.appendChild(newTime);

  // Move to view specific email when clicked
  newEmail.addEventListener('click', function() {
    // Get email by id
    fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(show_email)

    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3 class='subject'>${email.subject}</h3>`;

  });

  // Add new email to mailbox;
  document.querySelector('#emails-view').append(newEmail);

}

function show_email(email) {
  
    //Create email view
    const details = document.createElement('div');
    details.className = 'email';
    const sender = document.createElement('h5');
    sender.innerHTML = `From: ${email.sender} <hr>`;
    const recipients = document.createElement('div');
    recipients.innerHTML = `Sent to: ${email.recipients} <p class='timestamp' style='color:grey'>${email.timestamp}</p> <hr>`;
    const mailBody = document.createElement('div');
    mailBody.innerHTML = `${email.body}`;

    details.appendChild(sender);
    details.appendChild(recipients);
    details.appendChild(mailBody);

    //Add email to emails-view 
    document.querySelector('#emails-view').append(details);

}
