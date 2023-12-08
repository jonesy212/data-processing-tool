from flask_migrate import Migrate, migrate


# Configuring a callback function
@migrate.configure
def configure_alembic(config):
    # Modify config object or replace it with a different one
    config.set_main_option('custom_option', 'custom_value')
    return config
