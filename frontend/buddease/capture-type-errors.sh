#!/bin/bash

echo "🔍 Capturing ALL TypeScript type-only import errors..."
echo "=====================================================\n"

# Run TypeScript compiler to get ALL errors
pnpm exec tsc --noEmit --skipLibCheck 2>&1 | grep "is a type and must be imported" > type-errors.txt

echo "📄 Found errors saved to type-errors.txt"
echo "Analyzing patterns...\n"

# Extract type names from errors
cat type-errors.txt | sed -n "s/.*'\([^']*\)' is a type.*/\1/p" | sort | uniq > type-names.txt

echo "📋 Types that need 'import type':"
echo "================================="
cat type-names.txt
echo ""

# Count them
count=$(cat type-names.txt | wc -l | tr -d ' ')
echo "📊 Total unique types needing fixing: $count"