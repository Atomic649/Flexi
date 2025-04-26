FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies, including expo locally
RUN npm install

COPY . .

EXPOSE 8081

# Use the new local Expo CLI
CMD ["npx", "expo", "start", "--web"]