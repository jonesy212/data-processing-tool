import { useState } from 'react';
import React from "react";

// Invite Friends Component
const InviteFriends = () => {
  // State to track friends' email or phone numbers
  const [friendEmail, setFriendEmail] = useState('');
  const [friendPhoneNumber, setFriendPhoneNumber] = useState('');

  // Function to send an invitation via email
  const sendEmailInvitation = () => {
    // Replace this with your actual logic for sending email invitations
    alert(`Invitation sent to ${friendEmail} via email!`);
    // Additional logic such as API calls can be added here
  };

  // Function to send an invitation via text message
  const sendTextInvitation = () => {
    // Replace this with your actual logic for sending text invitations
    alert(`Invitation sent to ${friendPhoneNumber} via text message!`);
    // Additional logic such as API calls can be added here
  };

  return (
    <div>
      <h3>Invite Friends</h3>
      <p>Invite your friends to join using their email or phone number!</p>

      {/* Invite via Email */}
      <label>
        Friend's Email:
        <input type="email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} />
      </label>
      <button onClick={sendEmailInvitation}>Invite via Email</button>

      {/* Invite via Text Message */}
      <label>
        Friend's Phone Number:
        <input
          type="tel"
          value={friendPhoneNumber}
          onChange={(e) => setFriendPhoneNumber(e.target.value)}
        />
      </label>
      <button onClick={sendTextInvitation}>Invite via Text Message</button>
    </div>
  );
};

export default InviteFriends;
