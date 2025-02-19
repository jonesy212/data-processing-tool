# web3.py

from version_generator import \
    VersionGenerator  # Adjust the import based on your actual structure


class Web3:
    def __init__(self, name):
        self.name = name
        self.versioning_generator = VersionGenerator()  # Initialize the versioning generator

    def generate_version(self, version_number):
        # Use the versioning generator to create a version for Web3
        version_info = self.versioning_generator.generate_version(self.name, version_number)
        return version_info

    def get_version_info(self):
        # Retrieve the updated version information from the generator
        updated_version_info = self.versioning_generator.get_version_info()
        return updated_version_info


# Example Usage
if __name__ == "__main__":
    web3_instance = Web3(name="Web3App")

    # Generate a version for Web3
    web3_version_info = web3_instance.generate_version(version_number="1.0.0")
    print(f"Generated Web3 version: {web3_version_info}")

    # Simulate receiving changes from the versioning generator
    changes_from_generator = [
        "Added new feature",
        "Fixed a bug",
        "Changed existing functionality",
        # Add more changes as needed
    ]

    # Update Web3's functionality based on the changes
    web3_instance.update_functionality(changes_from_generator)

    # Get the updated version information from the generator
    updated_version_info = web3_instance.get_version_info()

    # Print the updated version info
    print(f"Updated Web3 version info: {updated_version_info}")
