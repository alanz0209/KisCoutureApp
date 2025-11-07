# Build script for Render
#!/bin/bash

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Build complete!"
