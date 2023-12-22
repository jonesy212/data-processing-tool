import asyncio
import logging

from logging_system.warning_events import log_error, log_exception, log_warning


class BaseVersionGenerator:
    def __init__(self, name):
        self.name = name
        self.version = "1.0.0"  # Set initial version
        self._changes = []
        self.logger = logging.getLogger(__name__)

    @property
    def _version(self):
        return self.version
    
    @property
    def changes(self):
        return list(self._changes)
    
    def update_version(self, new_version, changes):
        try:
            self.version = new_version
            self._changes.append({"version": new_version, "changes": changes})
            log_warning(f"Version updated successfully: {self.version}")
        except Exception as e:
            log_error(f"Failed to update version. Error {e}")

    async def async_update_version(self, new_version, changes):
        try:
            await asyncio.sleep(1)  # Simulating an async operation
            self.version = new_version
            self._changes.append({"version" : new_version, "changes": changes})
            log_warning({"version": new_version, "changes": changes})
        except Exception as e:
            log_error(f"Failed to update version. Error {e}")
            
    def get_version_info(self):
        try: 
            # your logic to retrievew version informtion here
            return {"name": self.name, "version": self.version, "changes": self.changes}
        except Exception as e:
            log_error(f"Failed to get version. Error {e}")
class AquaVersionGenerator(BaseVersionGenerator):
    def __init__(self):
        super().__init__("Aqua")


class Web3VersionGenerator(BaseVersionGenerator):
    def __init__(self):
        super().__init__("Web3")


class FluenceVersionGenerator(BaseVersionGenerator):
    def __init__(self):
        super().__init__("Fluence")


# Example usage:

# Create instances for Aqua, Web3, and Fluence
aqua_version_generator = AquaVersionGenerator()
web3_version_generator = Web3VersionGenerator()
fluence_version_generator = FluenceVersionGenerator()

# Update versions and changes
aqua_version_generator.update_version("2.0.0", ["Feature X added", "Bug fixes"])
web3_version_generator.update_version("3.1.0", ["Enhancements", "Security updates"])
fluence_version_generator.update_version("1.2.0", ["New functionality", "Performance improvements"])

# Get version information
print(aqua_version_generator.get_version_info())
print(web3_version_generator.get_version_info())
print(fluence_version_generator.get_version_info())

# Async update example
async def async_update(generator):
    await generator.async_update_version("2.1.0", ["Async feature added"])

# Run the async update
asyncio.run(async_update(aqua_version_generator))
print(aqua_version_generator.get_version_info())
