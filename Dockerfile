# Base image
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Production image
FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the bundled code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port the app runs on
EXPOSE 5000

# Start the server using the production build
CMD ["node", "dist/main"]
