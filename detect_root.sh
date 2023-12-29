# detect_root.sh

#!/bin/bash

# Check for the presence of the data_analysis file
if [ -f "data_analysis" ]; then
    echo "Found data_analysis file, setting root to both frontend and backend"
    # Your logic to set the root here, e.g., write to a configuration file
else
    echo "data_analysis file not found, assuming root is frontend"
    # Your logic to set the root here, e.g., write to a configuration file
fi
