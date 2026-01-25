#!/bin/bash
# scripts/shell/setup/unify-scripts.sh

echo "📁 Creating unified script structure..."

# Create main directories
mkdir -p scripts/{typescript,shell,unified,bin}

# TypeScript categories
mkdir -p scripts/typescript/{type-imports,code-quality,import-management,infrastructure,deployment,backup,code-gen,file-management,testing,utils}

# Shell categories  
mkdir -p scripts/shell/{build,deploy,git,backup,dev,config,setup}

echo "✅ Directory structure created"