#!/bin/bash
# scripts/cleanup-duplicates.sh

echo "🔍 Starting duplicate file cleanup..."
echo "====================================="

# Create a list of all migrated files with their new locations
MIGRATED_PATHS=(
  "scripts/typescript/testing/run-report-tests.ts"
  "scripts/shell/backup/one-command-migration.sh"
  # Add more paths as needed
)

# Common old locations to check
OLD_LOCATIONS=(
  "./"
  "scripts/"
  "app/scripts/"
  "scripts/migration-workflow/"
  "scripts/migration-backup/"
)

# Function to check if file exists and is not a symlink
check_and_remove_duplicate() {
  local new_path="$1"
  local old_path="$2"
  
  if [ -f "$new_path" ] && [ -f "$old_path" ] && [ ! -L "$old_path" ]; then
    echo "📊 Comparing $new_path vs $old_path"
    
    # Compare files
    if cmp -s "$new_path" "$old_path"; then
      echo "✅ Files are identical, removing duplicate: $old_path"
      rm "$old_path"
      echo "   Kept: $new_path"
    else
      echo "⚠️  Files differ, checking timestamps..."
      new_time=$(stat -f "%m" "$new_path" 2>/dev/null || stat -c "%Y" "$new_path")
      old_time=$(stat -f "%m" "$old_path" 2>/dev/null || stat -c "%Y" "$old_path")
      
      if [ "$new_time" -gt "$old_time" ]; then
        echo "🔄 Newer version found in new location, removing old: $old_path"
        rm "$old_path"
      else
        echo "❓ Files differ and old version might be newer, skipping: $old_path"
      fi
    fi
  fi
}

# Function to find possible old locations for a file
find_old_locations() {
  local filename="$1"
  
  for old_dir in "${OLD_LOCATIONS[@]}"; do
    if [ -f "$old_dir/$filename" ] && [ ! -L "$old_dir/$filename" ]; then
      echo "$old_dir/$filename"
    fi
  done
}

# Main cleanup logic
echo "📋 Checking for duplicates..."

for migrated_file in "${MIGRATED_PATHS[@]}"; do
  filename=$(basename "$migrated_file")
  echo ""
  echo "🔍 Looking for duplicates of: $filename"
  echo "   New location: $migrated_file"
  
  # Find old locations
  old_files=$(find_old_locations "$filename")
  
  if [ -n "$old_files" ]; then
    echo "   Found old versions:"
    for old_file in $old_files; do
      echo "   • $old_file"
    done
    
    # Ask for confirmation
    echo ""
    echo "❓ Remove these duplicates? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
      for old_file in $old_files; do
        check_and_remove_duplicate "$migrated_file" "$old_file"
      done
    else
      echo "⏸️  Skipping $filename"
    fi
  else
    echo "   ✅ No duplicates found"
  fi
done

# Also check for any other duplicates using a more comprehensive search
echo ""
echo "🕵️  Running comprehensive duplicate search..."
echo "============================================="

# Create a map of all files by checksum
declare -A checksum_map

# Find all non-symlink files in the project
find . -type f -not -path "./node_modules/*" \
                -not -path "./.git/*" \
                -not -path "./.migration-backups/*" \
                -not -path "./.smart-backups/*" | while read -r file; do
  # Skip symlinks
  if [ -L "$file" ]; then
    continue
  fi
  
  # Calculate checksum
  checksum=$(md5 -q "$file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1)
  
  # Add to map
  if [ -n "${checksum_map[$checksum]}" ]; then
    echo "⚠️  Potential duplicate found:"
    echo "   $file"
    echo "   ${checksum_map[$checksum]}"
    
    # Keep the one in scripts/ directory, remove the other
    if [[ "$file" == scripts/* ]]; then
      echo "   Keeping (in scripts/): $file"
      echo "   Removing: ${checksum_map[$checksum]}"
      rm "${checksum_map[$checksum]}"
    elif [[ "${checksum_map[$checksum]}" == scripts/* ]]; then
      echo "   Keeping (in scripts/): ${checksum_map[$checksum]}"
      echo "   Removing: $file"
      rm "$file"
    else
      echo "   ❓ Both outside scripts/, manual review needed"
    fi
  else
    checksum_map[$checksum]="$file"
  fi
done

echo ""
echo "✅ Duplicate cleanup complete!"
echo ""
echo "📋 Verification commands:"
echo "   pnpm script:verify-symlinks"
echo "   pnpm migration:verify"
echo "   find . -name \"run-report-tests.ts\" -o -name \"one-command-migration.sh\" | xargs ls -la"