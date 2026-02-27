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

# 3.5 Fix permissions (Critical for SQLite)
echo "Fixing permissions for data directory..."
# The web container runs as user 1001 (nextjs), so we need to ensure it owns the database file
# Migration might have changed ownership to root
if [ -d "data" ]; then
    chown -R 1001:1001 data/
fi

# 4. Restart the web service
echo "Restarting web service..."
docker compose up -d web

echo "Update completed! Database has been migrated and service restarted."