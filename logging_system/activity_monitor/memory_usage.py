import psutil  # Make sure to have psutil installed


def get_memory_usage():
    """Get current memory usage."""
    return psutil.virtual_memory().percent
