// SendSMS.tsx
import { sendSMS } from "@/core/api/sendSMS"; // 👈 clean import
import { useState } from 'react';

'use client';


const SendSMS = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSendSMS = async () => {
    setStatus('sending');
    try {
      await sendSMS(phoneNumber, message);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      <h3>Send SMS</h3>
      <p>Compose and send an SMS to a phone number.</p>

      <label>
        Phone Number:
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </label>

      <label>
        Message:
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      <button onClick={handleSendSMS} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send SMS'}
      </button>

      {status === 'sent' && <p>SMS sent successfully!</p>}
      {status === 'error' && <p>Failed to send SMS.</p>}
    </div>
  );
};

export default SendSMS;
