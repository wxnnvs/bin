# Use the smallest Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY index.js ./

# Create pastes directory
RUN mkdir -p pastes

# Use non-root user for security
USER node

# Expose the port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
