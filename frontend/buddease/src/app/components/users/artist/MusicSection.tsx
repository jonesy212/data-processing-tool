// MusicSection.tsx

import React from 'react';
import RandomWalkVisualization from '../../hooks/userInterface/RandomWalkVisualization';



const MusicSection: React.FC = () => {
  // Define album details
  const albumName = 'Dreamscape';
  const tracklist = ['Intro', 'Dreamscape', 'Reflections', 'Interlude', 'Awakening'];
  const albumCover = '/images/dreamscape_album_cover.jpg';

  return (
    <div>
      <h1>Explore Alex's Music</h1>
      <MusicAlbum albumName={albumName} tracklist={tracklist} albumCover={albumCover} />
      <h2>Discover More Music</h2>
      <RandomWalkVisualization />
    </div>
  );
};

export default MusicSection;
