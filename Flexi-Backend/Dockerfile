#----------Development Dockerfile for Flexi-Backend --------#
# Use an official Node.js LTS runtime as a parent image
FROM node:22-alpine AS builder

# Install qpdf  
RUN apk add --no-cache qpdf

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Copy the Prisma schema files before install so postinstall can access them
COPY prisma ./prisma/

# Install dependencies without running lifecycle scripts (avoid postinstall prisma generate here)
ENV NODE_ENV=development
RUN npm install --ignore-scripts

#--------  Production Dockerfile for Flexi-Backend  --------#
# Use an official Node.js LTS runtime as a parent image
FROM node:22-alpine AS production

# Install qpdf
RUN apk add --no-cache qpdf

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Copy the Prisma schema files before install so postinstall can access them
COPY prisma ./prisma/

# Install dependencies without running lifecycle scripts (avoid postinstall prisma generate here)
#ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Generate Prisma client for the current platform (handled by postinstall too)
RUN npm run prisma:generate:prod

# Build the application (transpile TypeScript to JavaScript)
RUN npm run build

# Run database migrations
#RUN npm run prisma:migrate

# Expose the port that the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start"] 