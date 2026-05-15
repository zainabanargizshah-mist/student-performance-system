FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Accept the API URL as a build argument and set it as env var
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build for production
RUN npm run build

# Copy serve config into dist
COPY serve.json dist/

# Install serve to run the built app
RUN npm install -g serve

# Serve the app with config
CMD ["serve", "dist", "-l", "10000", "-c", "../serve.json"]
