FROM node:18-bullseye-slim

# set working directory
WORKDIR /workspace

# copy package.json and package-lock.json* and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# copy all project files into the container
COPY . .

# Expose the port
EXPOSE 5556

# start the application with the npm start command
CMD ["npm", "start"]
