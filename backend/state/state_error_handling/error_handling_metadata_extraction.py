# error_handling_metadata_extraction.py
class MetadataExtractionError(Exception):
    pass

def handle_metadata_extraction_errors(error_type, details):
    raise MetadataExtractionError(f"Error in Metadata Extraction ({error_type}): {details}")
