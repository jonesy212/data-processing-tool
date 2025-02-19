# build_integration.py
import os

from metadata_extraction import extract_metadata, generate_metadata_file
from stores.generate_store import generate_store

from configs.config import Config


def integrate_build_process():
    try:
        # Paths
        src_path = os.path.join(os.path.dirname(__file__), Config.SRC_PATH)
        output_path_js = os.path.join(os.path.dirname(__file__), Config.OUTPUT_DIR, Config.METADATA_FILENAME_JS)
        output_path_tsx = os.path.join(os.path.dirname(__file__), Config.OUTPUT_DIR, Config.METADATA_FILENAME_TSX)

        # Extract metadata
        metadata = extract_metadata(src_path)

        # Generate metadata files
        generate_metadata_file(metadata, output_path_js)
        generate_metadata_file(metadata, output_path_tsx)

        # Generate Mobx state stores
        for entry in metadata:
            generate_store(entry['name'], entry['components'],os.path.join(os.path.dirname(__file__), Config.STORES_DIR))
        
        print("Build process integration successful.")
    except Exception as e:
        print(f"Error integrating build process: {str(e)}")

if __name__ == "__main__":
    integrate_build_process()
