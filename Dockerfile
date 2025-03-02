FROM node:slim
WORKDIR /usr/src/app/

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm install

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy the entire application
COPY . .

EXPOSE 8081

CMD ["npm", "run", "start"]
