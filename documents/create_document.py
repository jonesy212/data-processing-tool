# create_document.py

class DocumentCreator:
    def __init__(self, document):
        self.document = document

    def handle_simultaneous_edits(self, user, edited_content):
        # Logic to handle simultaneous edits
        # For example, apply operational transformation algorithms
        # ...
        updated_document = self.document.apply_edits(user, edited_content)
        return updated_document
