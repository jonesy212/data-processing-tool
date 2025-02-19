class OfflineEditingManager:
    def __init__(self):
        self.offline_users = set()

    def enable_offline_mode(self, user):
        # Logic to enable offline mode for the user
        if user not in self.offline_users:
            self.offline_users.add(user)
            print(f"Offline mode enabled for user: {user}")
        else:
            print(f"User {user} is already in offline mode.")

    def sync_changes_online(self, user, offline_changes):
        # Logic to synchronize offline changes when back online
        if user in self.offline_users:
            if offline_changes:
                # Apply synchronized changes to the online system
                print(f"Synchronizing changes for user {user}: {offline_changes}")
                # Your logic to apply changes to the online system goes here

                # Remove the user from the offline set
                self.offline_users.remove(user)
                print(f"User {user} is back online.")
            else:
                # Handle case where no changes need synchronization
                print(f"No changes to synchronize for user {user}.")
        else:
            # Handle case where user is not in offline mode or has already synced changes
            print(f"User {user} is not in offline mode or has already synced changes.")

    def check_offline_status(self, user):
        # Check if a user is currently in offline mode
        return user in self.offline_users

    def get_offline_users(self):
        # Get a list of users currently in offline mode
        return list(self.offline_users)

# Example usage:

# Create an instance of OfflineEditingManager
offline_editing_manager = OfflineEditingManager()

# Simulate enabling offline mode for a user
offline_editing_manager.enable_offline_mode("User1")

# Simulate making offline changes
offline_changes = ["Offline change 1", "Offline change 2"]

# Simulate synchronizing changes when back online
offline_editing_manager.sync_changes_online("User1", offline_changes)

# Check if a user is in offline mode
user_status = offline_editing_manager.check_offline_status("User1")
print(f"Is User1 in offline mode? {user_status}")

# Get a list of users currently in offline mode
offline_users_list = offline_editing_manager.get_offline_users()
print(f"Users currently in offline mode: {offline_users_list}")
