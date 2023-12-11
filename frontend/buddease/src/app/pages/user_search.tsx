<!-- search_users.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Search</title>
</head>
<body>

<h2>User Search</h2>

<form action="/api/users/search" method="GET">
    <label for="searchQuery">Search Query:</label>
    <input type="text" id="searchQuery" name="q" required>
    <button type="submit">Search</button>
</form>

<!-- Display search results here, if needed -->
<div id="searchResults">
    <!-- You can display the search results dynamically here using JavaScript or Flask templating -->
</div>

</body>
</html>
