// MusicAlbum.tsx

import React from 'react';

interface MusicAlbumProps {
  albumName: string;
  tracklist: string[];
  albumCover: string;
}

const MusicAlbum: React.FC<MusicAlbumProps> = ({ albumName, tracklist, albumCover }) => {
  return (
    <div>
      <h2>{albumName}</h2>
      <img src={albumCover} alt={albumName} />
      <ul>
        {tracklist.map((track, index) => (
          <li key={index}>{track}</li>
        ))}
      </ul>
    </div>
  );
};

export default MusicAlbum;
