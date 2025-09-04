#!/bin/bash

# Ensure all dependencies are installed
echo "Ensuring all dependencies are installed..."
npm install

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run seed if needed (only if no users exist)
echo "Checking if database needs seeding..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log(count);
  prisma.\$disconnect();
}).catch(() => {
  console.log('0');
  prisma.\$disconnect();
});
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "Database is empty, running seed..."
  npm run seed
else
  echo "Database already has $USER_COUNT users, skipping seed"
fi

# Start Prisma Studio in the background
echo "Starting Prisma Studio..."
npx prisma studio --hostname 0.0.0.0 --port 5555 &

# Start the application
echo "Starting application..."
npm run dev
