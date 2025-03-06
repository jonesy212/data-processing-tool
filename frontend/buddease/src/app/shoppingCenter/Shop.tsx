import React from 'react';
import ShoppingCenterConfig from './ShoppingCenterConfig'; // Import the ShoppingCenterConfig interface

const MarketplacePage: React.FC<{ shoppingCenterConfig: ShoppingCenterConfig }> = ({ shoppingCenterConfig }) => {
  // Dummy data representing premium draggable divs available in the marketplace
  const premiumDivs = [
    {
      id: 1,
      name: 'Professional Dashboard Template',
      designer: 'Designer A',
      priceUSD: 19.99,
      priceCrypto: 0.005, // Price in cryptocurrency
      description: 'A sleek and modern dashboard template for business applications.',
    },
    {
      id: 2,
      name: 'Creative Portfolio Layout',
      designer: 'Designer B',
      priceUSD: 24.99,
      priceCrypto: 0.006, // Price in cryptocurrency
      description: 'Showcase your work in style with this unique portfolio layout.',
    },
    {
      id: 3,
      name: 'Elegant Email Newsletter Design',
      designer: 'Designer C',
      priceUSD: 14.99,
      priceCrypto: 0.004, // Price in cryptocurrency
      description: 'Engage your subscribers with this elegant email newsletter design.',
    },
  ];

  // Function to handle purchase of premium draggable div
  const handlePurchase = (div: any) => {
    // Add logic to handle purchase, e.g., redirect to payment page
    console.log(`Purchased: ${div.name}`);
  };

  return (
    <div>
      <h2>{shoppingCenterConfig.name}</h2>
      <p>{shoppingCenterConfig.description}</p>

      {/* Render premium draggable divs */}
      {premiumDivs.map(div => (
        <div key={div.id} style={premiumDivStyle}>
          <h3>{div.name}</h3>
          <p>Designer: {div.designer}</p>
          <p>Price (USD): ${div.priceUSD}</p>
          <p>Price (Crypto): {div.priceCrypto} Crypto</p>
          <p>{div.description}</p>
          <button onClick={() => handlePurchase(div)}>Purchase</button>
        </div>
      ))}
    </div>
  );
};

// Style for premium draggable divs
const premiumDivStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: '5px',
  padding: '10px',
  marginBottom: '20px',
};

export default MarketplacePage;
