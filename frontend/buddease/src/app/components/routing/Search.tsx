import SearchComponent from '@/app/pages/searchs/Search';
import Script from 'next/script';
import React from 'react';

const SearchPage: React.FC = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        #TODO CONNECT STYSHEET
        <link rel="stylesheet" href="search.css" />
        <title>Global Search</title>
      </head>
      <body>
        <div className="search-container">
          <input type="text" id="searchInput" placeholder="Search..." />
          <button id="searchButton">Search</button>
          <div id="searchResults" className="search-results"></div>
        </div>

        <Script src="Search.tsx">

        </Script>
        <SearchComponent
          componentSpecificData={[]}
        />

      </body>
    </html>
  );
};

export default SearchPage;
