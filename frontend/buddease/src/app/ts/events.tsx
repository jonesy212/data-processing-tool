// Example of logging a session event from the frontend using JavaScript
function logSessionEvent(event, user) {
    fetch('/log/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, user }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error logging session event:', error));
}

// Call the function when a session event occurs
logSessionEvent('User logged in', 'john_doe');
