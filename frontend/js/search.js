// Simulated data for search results (replace with actual data)
const searchData = [
    { id: 1, title: 'Result 1', description: 'Description for Result 1' },
    { id: 2, title: 'Result 2', description: 'Description for Result 2' },
    // Add more data as needed
];

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsContainer = document.getElementById('searchResults');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('input', clearSearchResults);

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        const results = searchData.filter(item =>
            item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
        );

        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        searchResultsContainer.innerHTML = '';

        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p>No results found.</p>';
        } else {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.classList.add('search-result');
                resultElement.innerHTML = `
                    <h3>${result.title}</h3>
                    <p>${result.description}</p>
                `;
                searchResultsContainer.appendChild(resultElement);
            });
        }
    }

    function clearSearchResults() {
        searchResultsContainer.innerHTML = '';
    }
});
