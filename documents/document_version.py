# version_generator.py
import asyncio
import logging

class BaseVersionGenerator:
    def __init__(self, name):
        self.name = name
        self.version = "1.0.0"
        self._changes = []  # Changed from property to instance variable
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
            self.logger.warning(f"Version updated successfully: {self.version}")
        except Exception as e:
            self.logger.error(f"Failed to update version. Error {e}")

    async def async_update_version(self, new_version, changes):
        try:
            await asyncio.sleep(1)
            self.version = new_version
            self._changes.append({"version": new_version, "changes": changes})
            self.logger.warning(f"Version updated successfully: {self.version}")
        except Exception as e:
            self.logger.error(f"Failed to update version. Error {e}")

    def get_version_info(self):
        try:
            return {"name": self.name, "version": self.version, "changes": self.changes}
        except Exception as e:
            self.logger.error(f"Failed to get version. Error {e}")
