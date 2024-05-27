// TradingAssetsStep.tsx
import React, { useState } from 'react';
import { BlockchainAsset } from '../../users/BlockchainAsset';

// Import the BlockchainAsset interface

const TradingAssetsStep: React.FC<{ onSubmit: (assets: BlockchainAsset[]) => void }> = ({ onSubmit }) => {
  // Initialize state to manage trading assets
  const [assets, setAssets] = useState<BlockchainAsset[]>([]);

  // Function to handle adding a new asset
  const handleAddAsset = () => {
    // Create a new empty asset object and add it to the assets state
    setAssets([...assets, {
      id: '',
      name: '',
      symbol: '',
      balance: 0,
      contractAddress: '',
      decimals: 0,
      value: 0,
    }]);
  };

  // Function to handle updating asset information
  const handleAssetChange = (index: number, assetInfo: Partial<BlockchainAsset>) => {
    // Update the asset at the specified index with the new information
    const updatedAssets = [...assets];
    updatedAssets[index] = { ...updatedAssets[index], ...assetInfo };
    setAssets(updatedAssets);
  };

  // Function to handle removing an asset
  const handleRemoveAsset = (index: number) => {
    // Remove the asset at the specified index from the assets state
    const updatedAssets = [...assets];
    updatedAssets.splice(index, 1);
    setAssets(updatedAssets);
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(assets);
  };

  return (
    <div>
      <h2>Trading Assets</h2>
      <form onSubmit={handleSubmit}>
        {/* Render form fields for each asset */}
        {assets.map((asset, index) => (
          <div key={index}>
            <h3>Asset {index + 1}</h3>
            <label htmlFor={`assetName${index}`}>Name:</label>
            <input
              type="text"
              id={`assetName${index}`}
              value={asset.name}
              onChange={(e) => handleAssetChange(index, { name: e.target.value })}
              required
            />
            {/* Add more input fields for other asset properties */}
            {/* Example: Symbol, Balance, Contract Address, Decimals, etc. */}
            <button type="button" onClick={() => handleRemoveAsset(index)}>Remove</button>
          </div>
        ))}
        {/* Button to add a new asset */}
        <button type="button" onClick={handleAddAsset}>Add Asset</button>
        {/* Button to submit the form */}
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default TradingAssetsStep;
