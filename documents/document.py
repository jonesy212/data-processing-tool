import copy
import json
import os


class Document:
    def __init__(self):
        self.content = ""
        self.undo_stack = []
        self.redo_stack = []
        self.permissions = {}

    def apply_changes(self, changes, user):
        # Simulate applying changes to the document
        self.content += " ".join(changes)

        # Update undo stack
        self.undo_stack.append(copy.deepcopy(self.content))
        self.redo_stack.clear()

        print(f"Changes applied by {user}: {changes}")
        self.auto_save()

    def undo(self, user):
        if self.undo_stack:
            # Pop the last state from the undo stack
            last_state = self.undo_stack.pop()

            # Save the current state to the redo stack
            self.redo_stack.append(copy.deepcopy(self.content))

            # Update the document content
            self.content = last_state

            print(f"Undo by {user}")
            self.auto_save()
        else:
            print("Undo stack is empty.")

    def redo(self, user):
        if self.redo_stack:
            # Pop the last state from the redo stack
            last_state = self.redo_stack.pop()

            # Save the current state to the undo stack
            self.undo_stack.append(copy.deepcopy(self.content))

            # Update the document content
            self.content = last_state

            print(f"Redo by {user}")
            self.auto_save()
        else:
            print("Redo stack is empty.")

    def auto_save(self):
        # Simulate auto-save functionality
        save_data = {"content": self.content, "undo_stack": self.undo_stack, "redo_stack": self.redo_stack}
        with open("autosave.json", "w") as f:
            json.dump(save_data, f)
        print("Auto-save completed.")

    def set_permissions(self, user, level):
        # Set user permissions
        self.permissions[user] = level
        print(f"Permissions set for user {user}: {level}")

    def add_media(self, media_path):
        # Simulate adding multimedia elements to the document
        if os.path.exists(media_path):
            self.content += f" [Media: {media_path}] "
            print(f"Added media to the document: {media_path}")
            self.auto_save()
        else:
            print(f"Media file not found: {media_path}")


# Example usage:

# Create an instance of Document
document = Document()

# Apply changes and simulate undo/redo
document.apply_changes(["Add text 1"], "User1")
document.apply_changes(["Add text 2"], "User1")
document.apply_changes(["Add text 3"], "User2")

document.undo("User1")
document.redo("User1")

# Set user permissions
document.set_permissions("User1", "read-write")
document.set_permissions("User2", "read-only")

# Add multimedia elements
document.add_media("image1.jpg")
document.add_media("video1.mp4")
