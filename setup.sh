#!/bin/bash

# Ensure the data directory exists
if [ ! -d "data" ]; then
    echo "Creating data directory..."
    mkdir -p data
fi

# Initialize database if not present
if [ ! -f "data/dev.db" ]; then
    if [ -f "web/prisma/dev.db" ]; then
        echo "Copying existing development database..."
        cp web/prisma/dev.db data/dev.db
    else
        echo "No existing database found. A new one will be created by the application (if configured) or you may need to run migrations."
        # Note: Since it's SQLite, the app might need an initial migration if the DB file is missing.
        # But usually having dev.db is enough for a start.
    fi
fi

# Fix permissions for the data directory so the container user (nextjs: 1001) can write to it
echo "Setting permissions for data directory..."
chown -R 1001:1001 data

# Start the services
echo "Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

echo "Deployment container started on port 3011."
