// NFTConversionComponent.tsx

import React, { useState } from 'react';
import { observer } from 'mobx-react';
import  NFTService from '@/app/components/nft/NFTService';
const NFTConversionComponent: React.FC = () => {
  const [nftData, setNFTData] = useState<string>("");

  const convertNFT = async () => {
    try {
      const convertedData = await NFTService.convertNFT(nftData);
      console.log("Converted NFT data:", convertedData);
      // Handle converted data as needed
    } catch (error) {
      console.error("Error converting NFT:", error);
      // Handle error
    }
  };

  return (
    <div>
      <h2>NFT Conversion</h2>
      <textarea
        value={nftData}
        onChange={(e) => setNFTData(e.target.value)}
        placeholder="Enter NFT data..."
        rows={5}
        cols={50}
      />
      <br />
      <button onClick={convertNFT}>Convert NFT</button>
    </div>
  );
};

export default NFTConversionComponent;
