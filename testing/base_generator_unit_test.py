import asyncio
import unittest

from versioning.version_generator import \
    BaseVersionGenerator  # Replace 'your_module' with the actual module containing your versioning classes


class TestBaseVersionGenerator(unittest.TestCase):
    def setUp(self):
        # Create an instance of the BaseVersionGenerator for testing
        self.generator = BaseVersionGenerator("TestGenerator")

    def test_initial_version(self):
        # Ensure that the initial version is set correctly
        self.assertEqual(self.generator.version, "1.0.0")

    def test_update_version(self):
        # Test the update_version method
        new_version = "2.0.0"
        changes = ["Feature A added", "Bug fixes"]

        self.generator.update_version(new_version, changes)

        # Check if the version and changes are updated
        self.assertEqual(self.generator.version, new_version)
        self.assertEqual(self.generator.changes, [{"version": new_version, "changes": changes}])

    def test_async_update_version(self):
        # Test the async_update_version method
        new_version = "2.1.0"
        changes = ["Async feature added"]

        # Use asyncio.run to run the async method
        asyncio.run(self.generator.async_update_version(new_version, changes))

        # Check if the version and changes are updated asynchronously
        self.assertEqual(self.generator.version, new_version)
        self.assertEqual(self.generator.changes, [{"version": new_version, "changes": changes}])

    def test_get_version_info(self):
        # Test the get_version_info method
        version_info = self.generator.get_version_info()

        # Check if the returned dictionary contains the expected keys
        self.assertIn("name", version_info)
        self.assertIn("version", version_info)
        self.assertIn("changes", version_info)

if __name__ == "__main__":
    unittest.main()
