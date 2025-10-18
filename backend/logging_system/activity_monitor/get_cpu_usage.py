import psutil  # You may need to install the psutil library (e.g., pip install psutil)


def get_cpu_usage():
    """Get current CPU usage."""
    return psutil.cpu_percent(interval=1)  # You can adjust the interval as needed
