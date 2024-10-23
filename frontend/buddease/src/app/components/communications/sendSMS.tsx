import { useState } from 'react';
import React from "react";

// Function to send the SMS
export const sendSMS = (phoneNumber: string, message: string) => {
  // Replace this with your actual logic for sending SMS messages
  alert(`SMS sent to ${phoneNumber} with message: "${message}"`);
  // Additional logic such as API calls can be added here
};

// Send SMS Component
const SendSMS = () => {
  // State to track SMS details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Function to handle sending the SMS
  const handleSendSMS = () => {
    // Call the globally defined sendSMS function
    sendSMS(phoneNumber, message);
  };

  return (
    <div>
      <h3>Send SMS</h3>
      <p>Compose and send an SMS to a phone number.</p>

      {/* Phone Number Input */}
      <label>
        Phone Number:
        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </label>

      {/* Message Textarea */}
      <label>
        Message:
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      {/* Send Button */}
      <button onClick={handleSendSMS}>Send SMS</button>
    </div>
  );
};

export default SendSMS;
