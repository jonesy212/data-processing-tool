# other_script.py

from config import app
from script_commands.manage import init_app, init_cli, init_database

# other_script.py

init_database(app)

init_app(app)
cli = init_cli(app)

if __name__ == "__main__":
    cli()
