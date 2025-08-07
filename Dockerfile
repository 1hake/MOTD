# First stage: Build the application
# Name this stage as 'builder'
FROM --platform=linux/amd64 node:21 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy everything to /app directory
COPY ./ ./

# Build the application
RUN npm run build

# Second stage: Setup the Nginx server
FROM nginx:alpine

# Copy the build output from the 'builder' stage
COPY --from=builder /app/dist/ /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the Docker host, so we can access it 
# from the outside.
EXPOSE 80
