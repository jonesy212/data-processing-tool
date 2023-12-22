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

if __name__ == '__main__':
    unittest.main()
