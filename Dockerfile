FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
    qpdf \
    ghostscript \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server/requirements.txt ./server/requirements.txt
RUN pip3 install -r ./server/requirements.txt

COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["node", "server/index.cjs"]