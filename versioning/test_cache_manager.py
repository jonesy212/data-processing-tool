import unittest

from cache_manager import CacheManager


class TestCacheManager(unittest.TestCase):
    def setUp(self):
        self.cache_manager = CacheManager()

    def test_update_cache_with_valid_data(self):
        data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(data)
        self.assertEqual(self.cache_manager.get_cache_data(), data)

    def test_update_cache_with_duplicate_data(self):
        initial_data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(initial_data)

        # Attempt to update with data violating unique constraint
        with self.assertRaises(ValueError):
            self.cache_manager.update_cache({"key3": "value1", "key4": "value4"})

    def test_clear_cache(self):
        initial_data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(initial_data)

        self.cache_manager.clear_cache()
        self.assertEqual(self.cache_manager.get_cache_data(), {})

    def test_get_nonexistent_key(self):
        # Test getting a key that does not exist in the cache
        result = self.cache_manager.get_key("nonexistent_key")
        self.assertIsNone(result)

    def test_remove_key(self):
        initial_data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(initial_data)

        # Remove a key from the cache
        key_to_remove = "key1"
        self.cache_manager.remove_key(key_to_remove)
        
        # Verify that the key is removed
        self.assertNotIn(key_to_remove, self.cache_manager.get_cache_data())
        
        
    def test_update_cache_with_sensitive_data(self):
        # Test updating the cache with sensitive data
        sensitive_data = {"password": "sensitive_password", "token": "access_token"}
        with self.assertRaises(ValueError):
            self.cache_manager.update_cache(sensitive_data)

    def test_get_cache_data_copy(self):
        # Test that modifying the returned cache data copy doesn't affect the actual cache
        initial_data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(initial_data)

        cache_copy = self.cache_manager.get_cache_data_copy()

        # Modify the copy and check if the original cache remains unchanged
        cache_copy["key3"] = "value3"
        self.assertNotIn("key3", self.cache_manager.get_cache_data())

    def test_clear_cache_with_confirmation(self):
        # Test clearing the cache with a confirmation step
        initial_data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(initial_data)

        # Confirm the cache clearance
        self.cache_manager.confirm_clear_cache(True)

        # Verify that the cache is cleared after confirmation
        self.assertEqual(self.cache_manager.get_cache_data(), {})

    def test_clear_cache_without_confirmation(self):
        # Test attempting to clear the cache without confirmation
        initial_data = {"key1": "value1", "key2": "value2"}
        self.cache_manager.update_cache(initial_data)

        # Attempt to clear the cache without confirmation
        self.cache_manager.confirm_clear_cache(False)

        # Verify that the cache is not cleared without confirmation
        self.assertNotEqual(self.cache_manager.get_cache_data(), {})


if __name__ == '__main__':
    unittest.main()
