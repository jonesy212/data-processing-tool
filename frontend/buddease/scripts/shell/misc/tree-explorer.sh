#!/bin/bash

# tree-explorer.sh - Wrapper for tree explorer

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Run the tree explorer
node "$SCRIPT_DIR/tree-explorer.js" "$@"