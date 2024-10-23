from documents.create_document import DocumentCreator


class SimultaneousEditsHandler:
    def handle_simultaneous_edits(self, document_creator, user, edited_content):
        users = [user]
        edits = [edited_content]

        # Allow adding additional users and edits
        self.add_edits(users, edits)

        # Pass to document creator to handle
        document = document_creator.document

        # Apply operational transformation algorithms to merge edits concurrently
        merged_document = self.merge_edits(document, edits)

        # Return merged document
        return merged_document

class SimultaneousEditsHandler:
    def handle_simultaneous_edits(self, document_creator, user, edited_content):
        users = [user]
        edits = [edited_content]

        # Allow adding additional users and edits
        self.add_edits(users, edits)

        # Pass to document creator to handle
        document = document_creator.document

        # Apply operational transformation algorithms to merge edits concurrently
        merged_document = self.merge_edits(document, edits)

        # Return merged document
        return merged_document

    def add_edits(self, users, edits):
        # Ensure users and edits are lists
        if not isinstance(users, list):
            users = [users]
        if not isinstance(edits, list):
            edits = [edits]

        # Check if users and edits are of the same length
        if len(users) != len(edits):
            raise ValueError("Number of users and edits should be the same.")

        # Logic to add users and edits
        for user, edit in zip(users, edits):
            # Your logic to add users and their corresponding edits to the document
            # For example, you can maintain a dictionary with users as keys and their edits as values
            document_creator.add_user_edit(user, edit)

    def merge_edits(self, document, edits):
        # Apply operational transformation algorithms to merge edits concurrently
        # For demonstration purposes, let's assume a simple concatenation of edits

        # Split the document into tokens
        document_tokens = document.split()

        # Merge edits sequentially
        for edit in edits:
            # Split the edit into tokens
            edit_tokens = edit.split()

            # Find the common prefix between the document and edit
            common_prefix = self.find_common_prefix(document_tokens, edit_tokens)

            # Apply the edit after the common prefix
            transformed_edit = " ".join(edit_tokens[len(common_prefix):])

            # Concatenate the transformed edit to the document
            document_tokens += transformed_edit.split()

        # Combine the tokens into the merged document
        merged_document = " ".join(document_tokens)

        # Return the merged document
        return merged_document

    def find_common_prefix(self, list1, list2):
        # Find the common prefix between two lists
        common_prefix = []
        for item1, item2 in zip(list1, list2):
            if item1 == item2:
                common_prefix.append(item1)
            else:
                break
        return common_prefix

# Example usage:

# Create an instance of DocumentCreator
document_creator = DocumentCreator()

# Create an instance of SimultaneousEditsHandler
simultaneous_edits_handler = SimultaneousEditsHandler()

# Simulate edits
document = "The quick brown fox"
edits = [" jumps over", " the lazy dog"]

# Merge edits
merged_document = simultaneous_edits_handler.merge_edits(document, edits)

# Print the merged document
print("Merged Document:", merged_document)
# Example of how to use the SimultaneousEditsHandler:

# Simulate edits from multiple users
users = ["User1", "User2", "User3"]
edits = ["Edit1", "Edit2", "Edit3"]

# Handle simultaneous edits
resulting_document = simultaneous_edits_handler.handle_simultaneous_edits(document_creator, users, edits)

# Print the resulting document
print("Resulting Document:", resulting_document)
