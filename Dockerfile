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

CMD ["npm", "run", "start"]
ENTRYPOINT [ "sh", "-c" ]