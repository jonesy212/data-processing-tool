# version_generator.py

import asyncio


class VersionGenerator:
    def __init__(self, name):
        self.name = name
        self.version = "1.0.0"  # Set initial version
        self.changes = []

    def update_version(self, new_version, changes):
        self.version = new_version
        self.changes.append({"version": new_version, "changes": changes})

    async def async_update_version(self, new_version, changes):
        await asyncio.sleep(1)  # Simulating an async operation
        self.version = new_version
        self.changes.append({"version": new_version, "changes": changes})

    def get_version_info(self):
        return {"name": self.name, "version": self.version, "changes": self.changes}


# Example usage:

# Create instances for Aqua, Web3, and Fluence
aqua_version_generator = VersionGenerator(name="Aqua")
web3_version_generator = VersionGenerator(name="Web3")
fluence_version_generator = VersionGenerator(name="Fluence")

# Update versions and changes
aqua_version_generator.update_version("2.0.0", ["Feature X added", "Bug fixes"])
web3_version_generator.update_version("3.1.0", ["Enhancements", "Security updates"])
fluence_version_generator.update_version("1.2.0", ["New functionality", "Performance improvements"])

# Get version information
print(aqua_version_generator.get_version_info())
print(web3_version_generator.get_version_info())
print(fluence_version_generator.get_version_info())

# Async update example
async def async_update():
    await aqua_version_generator.async_update_version("2.1.0", ["Async feature added"])

# Run the async update
asyncio.run(async_update())
print(aqua_version_generator.get_version_info())
