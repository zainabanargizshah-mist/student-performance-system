FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build for production
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

# Serve the app
CMD ["serve", "-s", "dist", "-l", "5173"]
