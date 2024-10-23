class ConflictResolver:
    def resolve_conflict(self, user, conflicting_changes):
        # Logic to resolve conflicts when two users make conflicting changes
        print(f"Conflict resolution for user {user}: {conflicting_changes}")

        # For demonstration purposes, let's assume a simple strategy of concatenating conflicting changes
        resolved_changes = " ".join(conflicting_changes)

        print(f"Resolved changes: {resolved_changes}")
        return resolved_changes

# Example usage:

# Create an instance of ConflictResolver
conflict_resolver = ConflictResolver()

# Simulate conflicting changes
conflicting_changes = ["Change from User1", "Change from User2"]

# Simulate resolving conflicts
resolved_changes = conflict_resolver.resolve_conflict("User1", conflicting_changes)

# Print the resolved changes
print("Final resolved changes:", resolved_changes)
