# hooks.py

import logging

from logging_system.warning_events import log_exception, log_warning
from versioning.cache_manager import CacheManager


def on_cache_update_success(cache_name):
    """Hook called when cache update is successful."""
    log_warning(f"{cache_name} cache updated successfully.")

def on_cache_update_failure(cache_name, error):
    """Hook called when cache update fails."""
    log_exception(f"Failed to update {cache_name} cache. Error: {error}")

def create_custom_cache_manager(cache_name="default_cache"):
    """
    Create a custom cache manager instance with hooks.

    Args:
        cache_name (str): Name of the cache.

    Returns:
        CacheManager: Custom CacheManager instance.
    """
    logger = logging.getLogger(cache_name)

    def on_custom_cache_update_success():
        """Custom hook for successful cache update."""
        log_warning(f"{cache_name} custom cache updated successfully.")

    def on_custom_cache_update_failure(error):
        """Custom hook for failed cache update."""
        log_exception(f"Failed to update {cache_name} custom cache. Error: {error}")

    # Create a custom CacheManager with hooks
    custom_cache_manager = CacheManager(
        cache_name=cache_name,
        logger=logger,
        on_update_success=on_custom_cache_update_success,
        on_update_failure=on_custom_cache_update_failure
    )

    return custom_cache_manager
