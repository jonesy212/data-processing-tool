# Import the necessary modules and functions
from flask import request

from configs.config import app
from database.generators.async_generate_data import \
    generate_and_insert_fake_data


# Usage in a route or controller
# Usage in a route or controller
async def generate_data_route(request):
    model_name = request.args.get('model')  # Get the model name from the request
    num_records = int(request.args.get('num_records', 10))

    # Import the model dynamically based on the provided name
    model_class = globals().get(model_name)
    if model_class is None:
        return f"Invalid model name: {model_name}", 400

    # Generate and insert fake data for the specified model
    await generate_and_insert_fake_data(model_class, num_records)
    return f"Fake {model_name} data generated and inserted!"
# Example usage in your routes
app.add_route(generate_data_route, '/generate_data')
