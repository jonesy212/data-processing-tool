#todo important DocumentData.py 
from typing import Any, List

class DocumentData:
    def __init__(
        self,
        id: int,
        title: str,
        content: str,
        topics: List[str],
        highlights: List[str],
        keywords: List[str],
        files: List[Any],
        options: DocumentOptions,
        folder_path: str,
        previous_metadata: StructuredMetadata,
        current_metadata: StructuredMetadata,
        access_history: List[Any],
        load: Any = None,
        status: AllStatus = None,
        type: DocumentTypeEnum = None,
        locked: bool = False,
        changes: List[str] = [],
        document_phase: Phase = None,
        previous_content: str = None,
        current_content: str = None,
    ):
        self.id = id
        self.title = title
        self.content = content
        self.topics = topics
        self.highlights = highlights
        self.keywords = keywords
        self.load = load
        self.files = files
        self.status = status
        self.type = type
        self.locked = locked
        self.changes = changes
        self.options = options
        self.document_phase = document_phase
        self.folder_path = folder_path
        self.previous_content = previous_content
        self.current_content = current_content
        self.previous_metadata = previous_metadata
        self.current_metadata = current_metadata
        self.access_history = access_history
