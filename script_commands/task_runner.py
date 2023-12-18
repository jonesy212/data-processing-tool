# tasks.py
from invoke import task


@task
def run_server(ctx):
    """Run the Flask development server."""
    ctx.run("python main.py")

@task
def test(ctx):
    """Run unit tests."""
    ctx.run("pytest")

@task
def create_database(ctx):
    """Create or update the database schema."""
    ctx.run("python manage.py db migrate")
    ctx.run("python manage.py db upgrade")

@task
def generate_fake_data(ctx):
    """Generate fake data for testing."""
    ctx.run("python database/generate_fake_data.py")




# todo add: pip install pytest
# To run these tasks, you'd use commands like:

# bash
# Copy code
# invoke run-server
# invoke test
# invoke create_database
# invoke generate_fake_data
