from flask import Flask, jsonify, request
from flask_limiter import Limiter

from configs.config import app
from models.user.get_remote_address import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("20 per minute", error_message="Search rate limit exceeded.")
@app.route('/search', methods=['GET'])
def search():
    # Use request.args to access query parameters
    query = request.args.get('query')

    # Your search logic here using the 'query' parameter
    # Example: Perform a search based on the query parameter

    # Replace this with your actual search logic
    search_results = perform_search(query)

    return jsonify({"message": "Search results", "results": search_results})

def perform_search(query):
    # Implement your search logic here
    # This is a placeholder, replace it with your actual search implementation
    return [{"result": f"Result for query: {query}"}]

if __name__ == '__main__':
    app.run(debug=True)
