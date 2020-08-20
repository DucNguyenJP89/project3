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
  const newSubject = document.createElement('h5');
  newSubject.className = 'subject';
  newSubject.innerHTML = `Subject: ${email.subject}`;
  const newSender = document.createElement('p');
  newSender.className = 'sender';
  newSender.innerHTML = `Sender: ${email.sender}`;
  const newTime = document.createElement('p');
  newTime.className = 'timestamp';
  newTime.innerHTML = `${email.timestamp}`;

  newEmail.appendChild(newSubject);
  newEmail.appendChild(newSender);
  newEmail.appendChild(newTime);

  // Add new email to mailbox;
  document.querySelector('#emails-view').append(newEmail);

}