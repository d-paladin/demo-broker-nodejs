FROM node:18-bullseye-slim

# set working directory
WORKDIR /workspace

# copy package.json and package-lock.json (if available) and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# copy all project files into the container
COPY . .

# start the application with the npm start command
CMD ["npm", "start"]
