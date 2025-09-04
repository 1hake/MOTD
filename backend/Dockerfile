# Use an official Node.js runtime as a parent image
FROM node:21

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install -g nodemon ts-node typescript

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Install postgresql-client for pg_isready
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy and make startup script executable
COPY start.sh ./
RUN chmod +x start.sh

# Expose the port the app runs on
EXPOSE 4000

# Command to run the app
CMD ["bash", "start.sh"]