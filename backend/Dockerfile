# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy backend package.json and package-lock.json to the working directory
COPY backend/package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the backend application code to the working directory
COPY backend/ .

# Copy the compiled smart contract artifacts into the image
COPY contracts/artifacts /usr/src/contracts/artifacts

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define the default command to run the app (can be overridden in docker-compose)
CMD [ "npm", "start" ]