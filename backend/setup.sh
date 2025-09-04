#!/bin/bash

echo "🚀 Setting up Music BeReal Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

echo "✅ Docker and docker-compose are available"

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true

# Build the image
echo "🔨 Building Docker image..."
docker-compose build --no-cache

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is responding
echo "🔍 Checking backend health..."
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:4000"
else
    echo "❌ Backend is not responding. Check logs with: docker-compose logs app"
fi

# Check if Prisma Studio is running
echo "🔍 Checking Prisma Studio..."
if curl -s http://localhost:5555 > /dev/null; then
    echo "✅ Prisma Studio is running on http://localhost:5555"
else
    echo "❌ Prisma Studio is not responding. Check logs with: docker-compose logs app"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Available services:"
echo "  • Backend API: http://localhost:4000"
echo "  • Prisma Studio: http://localhost:5555"
echo "  • Database: localhost:5432"
echo ""
echo "🛠️  Useful commands:"
echo "  • View logs: docker-compose logs app -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"
echo "  • Access container: docker-compose exec app bash"
