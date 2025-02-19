// CryptoSectionToolbar.ts
import React from 'react';
import ToolbarItem from './ToolbarItem';
import { useCryptoStore } from '../stores/CryptoStore';

const CryptoSectionToolbar: React.FC = () => {
  const cryptoStore = useCryptoStore();

  const handleOptionClick = (option: string) => {
    // Logic to handle option click in the crypto section toolbar
    console.log(`Clicked ${option} in Crypto Section toolbar`);
    switch (option) {
      case 'View Cryptos':
        // Logic for handling view cryptos option
        console.log('Handling View Cryptos option');
        break;
      case 'Add Crypto':
        // Logic for handling add crypto option
        console.log('Handling Add Crypto option');
        break;
      case 'Manage Cryptos':
        // Logic for handling manage cryptos option
        console.log('Handling Manage Cryptos option');
        break;
      default:
        console.log('Option not recognized');
        break;
    }
  };

  // Define toolbar options for the crypto section
  const toolbarOptions = {
    cryptos: ['View Cryptos', 'Add Crypto', 'Manage Cryptos'],
    // Add more crypto section options as needed
  };

  return (
    <div className="toolbar">
      <h2>Crypto Section Toolbar</h2>
      <ul>
        {toolbarOptions.cryptos.map((option: string, index: number) => (
          <li key={index}>
            <ToolbarItem
              id={`crypto-section-toolbar-item-${index}`}
              label={option}
              onClick={() => handleOptionClick(option)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CryptoSectionToolbar;
