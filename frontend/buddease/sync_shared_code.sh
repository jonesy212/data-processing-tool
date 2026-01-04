# sync_shared_code.sh

#!/bin/bash

# Define paths to frontend and backend projects within the shared repository
FRONTEND_DIR="frontend-project"
BACKEND_DIR="backend-project"

# Define path to the shared code directory
SHARED_CODE_DIR="shared-code"

# Synchronize shared code from frontend to backend
echo "Synchronizing shared code from frontend to backend..."
rsync -av --exclude="$BACKEND_DIR" "$FRONTEND_DIR/$SHARED_CODE_DIR/" "$BACKEND_DIR/$SHARED_CODE_DIR"

# Synchronize shared code from backend to frontend
echo "Synchronizing shared code from backend to frontend..."
rsync -av --exclude="$FRONTEND_DIR" "$BACKEND_DIR/$SHARED_CODE_DIR/" "$FRONTEND_DIR/$SHARED_CODE_DIR"

echo "Shared code synchronization completed."
