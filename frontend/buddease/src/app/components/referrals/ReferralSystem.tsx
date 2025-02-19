import React, { useState } from 'react';

// Referral System Component
const ReferralSystem = () => {
  // State to track referral information
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');

  // Function to generate a referral link based on a referral code
  const generateReferralLink = (code: string) => {
    // Replace this with your actual logic for generating a referral link
    return `https://example.com/signup?ref=${code}`;
  };

  // Function to handle the referral code input change
  const handleReferralCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(event.target.value);
  };

  // Function to handle the referral link generation
  const handleGenerateLink = () => {
    // Validate the referral code (add your validation logic here)
    if (referralCode.trim() === '') {
      alert('Please enter a valid referral code.');
      return;
    }

    // Generate the referral link
    const link = generateReferralLink(referralCode);
    setReferralLink(link);
  };

  return (
    <div>
      <h3>Referral System</h3>
      <p>Invite your friends to join using your referral code and earn rewards!</p>

      {/* Referral Code Input */}
      <label>
        Referral Code:
        <input type="text" value={referralCode} onChange={handleReferralCodeChange} />
      </label>

      {/* Generate Referral Link Button */}
      <button onClick={handleGenerateLink}>Generate Referral Link</button>

      {/* Display Referral Link */}
      {referralLink && (
        <div>
          <p>Your Referral Link:</p>
          <a href={referralLink} target="_blank" rel="noopener noreferrer">
            {referralLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default ReferralSystem;
