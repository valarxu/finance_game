#!/bin/bash

echo "Starting update process..."

# 1. Pull latest code (optional, assuming user might have done it manually or via git hooks)
# git pull

# 2. Build the services
echo "Building Docker images..."
docker compose build web

# 3. Run database migrations
# This uses the 'migrate' service defined in docker-compose.yml which has the prisma CLI
echo "Running database migrations..."
docker compose run --rm migrate

# 4. Restart the web service
echo "Restarting web service..."
docker compose up -d web

echo "Update completed! Database has been migrated and service restarted."