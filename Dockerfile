FROM node:18

# Install qpdf
RUN apt-get update && apt-get install -y qpdf

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install Node deps
RUN npm install

# Expose port
EXPOSE 10000

# Start server
CMD ["node", "server/index.cjs"]