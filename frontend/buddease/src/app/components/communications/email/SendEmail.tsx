'use client';

import { useState } from 'react';
import React from "react";
import { sendEmail } from "./sendEmail"; // 👈 clean import

export const SendEmail = ({
  recipient,
  subject,
  message,
}: {
  recipient: string;
  subject: string;
  message: string;
}) => {
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] =
    useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSendEmail = async () => {
    setIsSending(true);
    setEmailStatus('sending');
    try {
      await sendEmail(recipient, subject, message);
      setEmailStatus('sent');
    } catch {
      setEmailStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <button onClick={handleSendEmail} disabled={isSending}>
        {isSending ? 'Sending...' : 'Send Email'}
      </button>
      {emailStatus === 'sent' && <p>Email sent successfully!</p>}
      {emailStatus === 'error' && <p>Failed to send email.</p>}
    </div>
  );
};

export default SendEmail;