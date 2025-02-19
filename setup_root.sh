#!/bin/bash

# Prompt the user to choose the root directory based on the frontend
echo "Select the root directory for your project:"
select root_directory in */; do
    case $root_directory in
        frontend/ )
            echo "Setting root to frontend"
            # Your logic to set the root here, e.g., write to a configuration file
            break
            ;;
        * )
            echo "Invalid selection, please choose a valid option."
            ;;
    esac
done
