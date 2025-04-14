# Use an official Node.js LTS runtime as a parent image
FROM node:20-alpine

# Install Expo CLI globally
RUN npm install -g expo-cli

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .


CMD ["npm", "start"]