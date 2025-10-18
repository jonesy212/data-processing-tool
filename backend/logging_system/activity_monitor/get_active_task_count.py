
def get_active_task_count(self, task_type):
    """Get the count of active tasks for a specific type."""
    return self.active_task_counts.get(task_type, 0)

