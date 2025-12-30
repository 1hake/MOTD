# Music BeReal Backend

A Node.js/Express backend with Prisma ORM, PostgreSQL database, and automated setup.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
./setup.sh
```

### Option 2: Manual Setup

```bash
docker-compose up -d
```

That's it! The setup is fully automated and will:

- ✅ Wait for the database to be ready
- ✅ Run database migrations automatically
- ✅ Seed the database with sample data (only if empty)
- ✅ Start Prisma Studio automatically
- ✅ Start the backend server

## 📋 Manual Setup (if needed)

### 1) Build and start containers:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### 2) Access the services:

- **Backend API**: http://localhost:4000
- **Prisma Studio**: http://localhost:5555
- **Database**: localhost:5432

## 🛠️ Development Commands

### View logs:

```bash
docker-compose logs app -f
```

### Access the container:

```bash
docker-compose exec app bash
```

### Prisma Studio:

Prisma Studio starts automatically with the container and is available at http://localhost:5555

### Manual database operations (if needed):

```bash
# Run migrations
docker-compose exec app npx prisma migrate dev

# Seed database
docker-compose exec app npm run seed

# Reset database
docker-compose exec app npx prisma migrate reset
```

## 🏗️ Architecture

- **Runtime**: Node.js 21
- **Framework**: Express.js
- **Database**: PostgreSQL 14
- **ORM**: Prisma
- **Development**: TypeScript + nodemon
- **Containerization**: Docker + Docker Compose

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/          # API routes
│   ├── index.ts         # Main server file
│   └── prismaClient.ts  # Prisma client
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Database seeding
├── start.sh             # Automated startup script
├── Dockerfile           # Container configuration
└── docker-compose.yaml  # Service orchestration
```

## 🔧 Environment Variables

The following environment variables are configured in `docker-compose.yaml` or `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `FIREBASE_SERVICE_ACCOUNT`: (Optional) JSON string of your Firebase Service Account key to enable push notifications.

## 🔔 Push Notifications (Firebase)

To enable push notifications:

1. Go to Firebase Console > Project Settings > Service Accounts.
2. Click "Generate new private key".
3. Convert the downloaded JSON into a single string and set it as `FIREBASE_SERVICE_ACCOUNT` in your `.env` or `docker-compose.yaml`.
   - On Linux/Mac, you can use: `cat service-account.json | jq -c . | sed 's/"/\\"/g'` or just use a tool like [JSON to Single Line](https://www.freeformatter.com/json-escape.html).

### Sending Daily Notifications

Run the following command to notify all users:

```bash
npm run notify:daily
```

## 🎯 Features

- **Automated Setup**: No manual migration or seeding required
- **Smart Seeding**: Only seeds if database is empty
- **Database Health Checks**: Waits for PostgreSQL to be ready
- **Hot Reload**: Development server with nodemon
- **Type Safety**: Full TypeScript support
- **API Documentation**: RESTful API endpoints

## 🚨 Troubleshooting

### "Cannot find module 'object-assign'" error:

```bash
# This is usually fixed by rebuilding the container
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Container won't start:

```bash
docker-compose down -v  # Remove volumes
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues:

```bash
docker-compose logs db
docker-compose exec app npx prisma db push
```

### Reset everything:

```bash
docker-compose down -v
docker-compose up -d
```
