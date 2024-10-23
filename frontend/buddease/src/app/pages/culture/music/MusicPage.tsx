// MusicPage.tsx

import React from 'react';
import MusicSection from '../../../components/users/artist/MusicSection';

const MusicPage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Alex's Music Page</h1>
      <p>Explore Alex's latest music album and discover captivating melodies.</p>
      <MusicSection />
      {/* Add a purchase button for the music album */}
      <button>Buy Now</button>
    </div>
  );
};

export default MusicPage;
