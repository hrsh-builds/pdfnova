# Use Node base image
FROM node:20-bullseye

# Install qpdf + python
RUN apt-get update && apt-get install -y \
    qpdf \
    python3 \
    python3-pip \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy Python requirements
COPY server/requirements.txt ./server/requirements.txt

# Install python packages
RUN pip3 install -r ./server/requirements.txt

# Copy full project
COPY . .

# Set port
ENV PORT=10000
EXPOSE 10000

# Start server
CMD ["node", "server/index.cjs"]