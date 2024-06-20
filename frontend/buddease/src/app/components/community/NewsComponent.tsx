// NewsComponent.tsx
import { useState } from 'react';
import useFiltering from '../hooks/useFiltering';
import { SearchOptions } from '@/app/pages/searchs/SearchOptions';

const NewsComponent = (options: SearchOptions) => {
  const { addFilter, handleSubmit } = useFiltering(options);

  // State to hold filtered news data
  const [filteredNews, setFilteredNews] = useState<any[]>([]);

  // Function to update UI with filtered news
  const updateFilteredNewsUI = (filteredNews: any[]): void => {
    console.log('Updating UI with filtered news:', filteredNews);
    // Update state with filtered news
    setFilteredNews(filteredNews);
    // Implement actual UI update logic based on filtered news
    // Example: Update news feed component or dashboard
  };

  // Function to handle filtering and UI update
  const handleFilterAndUIUpdate = () => {
    // Example: Adding a filter for news articles related to 'technology'
    addFilter("category", "equal", "technology");

    // Submitting filters to fetch filtered news
    handleSubmit()
      .then((response: any) => {
        // Assuming response.data contains filtered news articles
        updateFilteredNewsUI(response.data);
      })
      .catch((error: any) => {
        console.error("Error filtering news:", error);
        // Handle error and notify user
      });
  };

  return (
    <div>
      <h2>Filtered News</h2>
      <button onClick={handleFilterAndUIUpdate}>Filter News</button>
      <div>
        {/* Render filtered news in your UI */}
        {filteredNews.map((newsItem, index) => (
          <div key={index}>
            <h3>{newsItem.title}</h3>
            <p>{newsItem.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;
