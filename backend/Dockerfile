# Base image
FROM node:20.2.0-alpine3.18

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json to the container
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install 

# Copy the rest of the project files to the container
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Build the Next.js app
RUN pnpm run build

# Expose the port that Next.js uses
# EXPOSE ${PORT}

# Start the Next.js app
CMD ["pnpm", "start"]