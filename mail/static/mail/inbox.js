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
  document.querySelector('#compose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    //Get information from form input
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send email to recipients
    fetch('/emails', {method: 'POST', body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
      })
    })
    .then(response => {
      if (response.status !== 201) {
        return response.json().then(result => alert("Error: " + result.error)).then(compose_email());
      } else if (response.status === 201) {
        return response.json().then(result => {
          alert(result.message);
          load_mailbox('sent');
        });
      }
    })
    
  })

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
  const newArchived = document.createElement('button');
  newArchived.className = 'archive-button';
  newArchived.innerHTML = 'Archive'; 
  newArchived.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    //Update unarchived to archived
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    .then(response => {
      alert(response.status + " Mail archived");
      load_mailbox('inbox');
    })
  });

  const unarchiveButton = document.createElement('button');
  unarchiveButton.className = 'archive-button';
  unarchiveButton.innerHTML = 'Move to inbox';
  unarchiveButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();

      //Update archived to unarchived
      fetch(`emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      .then(response => {
        alert(response.status + " Mail unarchived");
        return load_mailbox('inbox');
      })
    })

  newEmail.appendChild(newSubject);
  newEmail.appendChild(newSender);
  newEmail.appendChild(newRecipients);
  newEmail.appendChild(newTime);
  if ((email.user !== email.sender) && (email.archived === false)) {
    newSubject.appendChild(newArchived);
  } else if ((email.user !== email.sender) && (email.archived === true)) {
    newSubject.appendChild(unarchiveButton);
  }

  // Move to view specific email when clicked
  newEmail.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    // Get email by id
    fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      show_email(email);
      if (email.read === false) {
        fetch(`emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }
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
    const reply = document.createElement('button');
    reply.className = 'reply-button';
    reply.innerHTML = 'Reply';
    reply.addEventListener('click', function(event) {
      event.preventDefault();

      //Load compose email view
      compose_email();

      //Create pre-fill content
      const preBody = `================
      On ${email.timestamp}
      ${email.sender} wrote: ${email.body}`

      const pattern = new RegExp(/\bRe:/i);
      if (pattern.test(email.subject)) {
        preSubject = email.subject;
      } else {
        preSubject = "Re: " + email.subject;
      }

      //Pre-fill information
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = preSubject;
      document.querySelector('#compose-body').value = "\n" + preBody;
    })

    
    // Add content to the email 
    details.appendChild(sender);
    details.appendChild(recipients);
    details.appendChild(mailBody);
    details.appendChild(reply);

    //Add email to emails-view 
    document.querySelector('#emails-view').append(details);

}
