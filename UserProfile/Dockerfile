# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json before running npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the correct port
EXPOSE 8003

# Define environment variables
ENV PORT=8003
ENV MONGO_URL=mongodb://mongo:27017/userprofiledb

# Start the application
CMD ["node", "profile.js"]
