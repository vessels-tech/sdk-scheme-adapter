FROM node:10.15.3-alpine
WORKDIR /opt/sdk-scheme-adapter

RUN apk add --no-cache -t build-dependencies git make gcc g++ python libtool autoconf automake \
  && cd $(npm root -g)/npm \
  && npm config set unsafe-perm true \
  && npm install -g node-gyp

COPY package.json package-lock.json* /opt/sdk-scheme-adapter/
RUN npm install

COPY src /opt/sdk-scheme-adapter/src
COPY secrets /opt/sdk-scheme-adapter/secrets

EXPOSE 4000
CMD ["npm", "run", "start"]
ENTRYPOINT [ "sh", "-c" ]

# FROM node:8.11.3-alpine

# EXPOSE 3000

# COPY ./secrets /

# WORKDIR /src/

# CMD ["node", "/src/index.js"]

# COPY ./src/ /src/
# RUN npm install --production
