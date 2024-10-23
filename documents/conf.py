import os
import sys

extensions = [
    'sphinx.ext.autodoc',
    # other extensions...
]

# Include both class and __init__ docstrings
autodoc_default_options = {
    'members': True,
    'special-members': '__init__',
}



sys.path.insert(0, os.path.abspath('../'))  # Adjust the path accordingly


