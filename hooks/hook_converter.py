# hook_converter.py

import re

def convert_python_to_typescript(python_code):
    # Define patterns for recognizing Python hooks
    pattern_on_success = re.compile(r'on_cache_update_success\("(.+?)"\)', re.MULTILINE)
    pattern_on_failure = re.compile(r'on_cache_update_failure\("(.+?)", (.+?)\)', re.MULTILINE)

    # Convert Python hooks to TypeScript
    ts_code = python_code
    ts_code = pattern_on_success.sub(r'onCacheUpdateSuccess("\1")', ts_code)
    ts_code = pattern_on_failure.sub(r'onCacheUpdateFailure("\1", \2)', ts_code)

    return ts_code

# Example usage:
python_code = """
# Your Python code with hooks

on_cache_update_success("default_cache")
on_cache_update_failure("custom_cache", error)
"""

typescript_code = convert_python_to_typescript(python_code)
print(typescript_code)
