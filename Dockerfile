# Use lightweight Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# --production flag skips devDependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 3020

# Environment variable for port (optional, matches the default in code)
ENV PORT=3020

# Command to run the application
CMD ["node", "index.js"]
