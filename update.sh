#!/bin/bash

echo "Starting update process..."

# 1. Pull latest code (optional, assuming user might have done it manually or via git hooks)
# git pull

# 2. Build the services
echo "Building Docker images..."
if command -v docker-compose &> /dev/null; then
    docker-compose build web
else
    docker compose build web
fi

# 3. Run database migrations
# This uses the 'migrate' service defined in docker-compose.yml which has the prisma CLI
echo "Running database migrations..."
if command -v docker-compose &> /dev/null; then
    docker-compose run --rm migrate
else
    docker compose run --rm migrate
fi

# 4. Restart the web service
echo "Restarting web service..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d web
else
    docker compose up -d web
fi

echo "Update completed! Database has been migrated and service restarted."
