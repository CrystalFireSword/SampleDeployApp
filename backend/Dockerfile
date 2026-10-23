# Use official lightweight Node.js Alpine base image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Set default runtime environment variables
# (These can be overridden when running the container: docker run -e PORT=... )
ENV NODE_ENV=production \
    PORT=5005 \
    APP_NAME="Deployment Test API (Docker)" \
    MESSAGE="Hello from Docker container! Environment variables are loaded." \
    API_KEY=""

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Run as non-privileged user for security
USER node

# Document the listening port
EXPOSE 5005

# Start the application
CMD ["node", "server.js"]
