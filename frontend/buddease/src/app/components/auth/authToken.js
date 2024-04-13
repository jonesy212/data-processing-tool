// Example code to include authentication token in requests
export const authToken = 'YOUR_AUTH_TOKEN';
fetch('/api/data', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Accept': 'application/vnd.yourapp.v1+json' // Example API version
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
