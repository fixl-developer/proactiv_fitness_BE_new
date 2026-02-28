#!/bin/bash

# Git Workflow Setup Script
# Run this once to setup your branching strategy

echo "🚀 Setting up Git workflow..."

# Ensure we're on main branch
git checkout main

# Create develop branch if it doesn't exist
if git show-ref --verify --quiet refs/heads/develop; then
    echo "✅ Develop branch already exists"
else
    echo "📝 Creating develop branch..."
    git checkout -b develop
    git push -u origin develop
fi

# Switch back to develop
git checkout develop

echo "✅ Git workflow setup complete!"
echo ""
echo "📋 Available branches:"
git branch -a
echo ""
echo "🎯 You are now on: $(git branch --show-current)"
echo ""
echo "💡 To create a new feature branch:"
echo "   git checkout -b feature/your-feature-name"
