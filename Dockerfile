# Build stage for frontend
FROM node:22-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy backend files
COPY backend/ ./backend/

# Copy built frontend from build stage
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "backend/server.js"]
