// TradingBasicInfoStep.tsx
import React, { useState } from 'react';

const TradingBasicInfoStep: React.FC<{ onSubmit: (basicInfo: any) => void }> = ({ onSubmit }) => {
  const [basicInfo, setBasicInfo] = useState({
    tradingName: '',
    tradingDescription: '',
    tradingPlatform: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo({ ...basicInfo, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(basicInfo);
  };

  return (
    <div>
      <h2>Trading Basic Information</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tradingName">Trading Name:</label>
          <input
            type="text"
            id="tradingName"
            name="tradingName"
            value={basicInfo.tradingName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="tradingDescription">Trading Description:</label>
          <textarea
            id="tradingDescription"
            name="tradingDescription"
            value={basicInfo.tradingDescription}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="tradingPlatform">Trading Platform:</label>
          <input
            type="text"
            id="tradingPlatform"
            name="tradingPlatform"
            value={basicInfo.tradingPlatform}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default TradingBasicInfoStep;
