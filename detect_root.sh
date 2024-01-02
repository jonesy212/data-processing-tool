#!/bin/bash

# Detect root directory
if [ -f "data_analysis" ]; then
    ROOT="both"  # Both frontend and backend
else
    ROOT="frontend"
fi

# Your logic to generate components based on the ROOT variable
if [ "$ROOT" = "both" ]; then
    # Generate components for both frontend and backend
    echo "Generating components for both frontend and backend..."
    # Your component generation logic for both frontend and backend
else
    # Generate components for frontend only
    echo "Generating components for frontend..."
    # Your component generation logic for frontend
fi
