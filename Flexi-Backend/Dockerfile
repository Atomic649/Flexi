# Use an official Node.js LTS runtime as a parent image
FROM node:22-alpine

# Install qpdf
RUN apk add --no-cache qpdf

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the Prisma schema file to the container
COPY prisma ./prisma/

# Copy the rest of the application code
COPY . .

# Build the application (transpile TypeScript to JavaScript)
RUN npm run build

# Generate Prisma client
RUN npm run prisma:generate

# Run database migrations
#RUN npm run prisma:migrate

# Expose the port that the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start"] 