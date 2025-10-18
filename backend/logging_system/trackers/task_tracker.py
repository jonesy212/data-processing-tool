from logging_system.activity_monitor.get_active_task_count import \
    get_active_task_count


class TaskTracker:
    def __init__(self):
        self.active_task_counts = {
            'users': 0,
            'projects': 0,
            'teams': 0
        }
        self.completed_tasks = set()

    def start_task(self, task_type):
        """Increment the count when a task is started."""
        self.active_task_counts[task_type] += 1

    def complete_task(self, task_type):
        """Decrement the count when a task is completed."""
        if self.active_task_counts[task_type] > 0:
            self.active_task_counts[task_type] -= 1
            self.completed_tasks.add(task_type)
        else:
            print(f"Error: No active tasks of type '{task_type}' to complete.")

    def revert_task(self, task_type):
        """Revert a completed task back to in progress."""
        if task_type in self.completed_tasks:
            self.active_task_counts[task_type] += 1
            self.completed_tasks.remove(task_type)
        else:
            print(f"Error: Task of type '{task_type}' is not completed.")


# Example Usage:
task_tracker = TaskTracker()

# Start tasks
task_tracker.start_task('users')
task_tracker.start_task('projects')
task_tracker.start_task('teams')

# Complete and revert tasks
task_tracker.complete_task('users')
task_tracker.complete_task('projects')
task_tracker.revert_task('users')

# Get active task counts
users_count = task_tracker.get_active_task_count('users')
projects_count = task_tracker.get_active_task_count('projects')
teams_count = task_tracker.get_active_task_count('teams')

print(f"Active Users Tasks: {users_count}")
print(f"Active Projects Tasks: {projects_count}")
print(f"Active Teams Tasks: {teams_count}")

# Assuming you have a variable tracking the number of active tasks
active_task_count = 0
