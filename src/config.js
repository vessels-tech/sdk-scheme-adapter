/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       James Bush - james.bush@modusbox.com                             *
 **************************************************************************/

'use strict';


const fs = require('fs');
const path = require('path');


// A promise wrapper around fs.readFile
// Redundant on node 10 and above, use require('fs').promises instead
async function readFile(...args) {
    console.log("reading file", ...args)
    const p = new Promise((resolve, reject) => {
        fs.readFile(...args, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
    return p;
}

async function readFilesDelimitedList(delimiter, list) {
    return Promise.all(list.split(delimiter).map(filename => readFile(filename)));
}


function parseBoolean(value) {
    if (!value) {
        return false;
    }

    if (value.toLowerCase() === 'false') {
        return false;
    }

    return true;
}



// TODO: implement toString, toJSON toAnythingElse methods on config so that secrets can't be
// printed
let config = {
    inboundPort: 4000,
    outboundPort: 4001,
    peerEndpoint: '172.17.0.2:3001',
    backendEndpoint: '172.17.0.2:3001',
    // dfspId: 'lewbank1',
    dfspId: 'mojaloop-sdk',
    ilpSecret: 'mojaloop-sdk',
    checkIlp: true,
    expirySeconds: 60,
    autoAcceptQuotes: true,
    tls: {
        mutualTLS: { enabled: false },
        inboundCreds: {
            ca: null,
            cert: null,
            key: null
        },
        outboundCreds: {
            ca: null,
            cert: null,
            key: null
        }
    },
    validateInboundJws: false,
    jwsSign: false,
    jwsSigningKey: null,
    jwsVerificationKeysDirectory: null,
    cacheConfig: {
        host: 'localhost',
        port: 6379
    },
    enableTestFeatures: false,
    addHostHeader: true
};


const setConfig = async cfg => {
    config.inboundPort = cfg.INBOUND_LISTEN_PORT;
    config.outboundPort = cfg.OUTBOUND_LISTEN_PORT;
    config.tls.mutualTLS.enabled = parseBoolean(cfg.MUTUAL_TLS_ENABLED)

    config.peerEndpoint = cfg.PEER_ENDPOINT;
    config.backendEndpoint = cfg.BACKEND_ENDPOINT;

    config.dfspId = cfg.DFSP_ID;
    config.ilpSecret = cfg.ILP_SECRET;
    config.checkIlp = parseBoolean(cfg.CHECK_ILP)
    config.expirySeconds = Number(cfg.EXPIRY_SECONDS);
    config.autoAcceptQuotes = parseBoolean(cfg.AUTO_ACCEPT_QUOTES)

    // Getting secrets from files instead of environment variables reduces the likelihood of
    // accidental leakage.
    if (config.tls.mutualTLS.enabled) {
        // read inbound certs/keys
        [config.tls.inboundCreds.ca, config.tls.inboundCreds.cert, config.tls.inboundCreds.key] = await Promise.all([
            readFilesDelimitedList(',', cfg.IN_CA_CERT_PATH),
            readFile(cfg.IN_SERVER_CERT_PATH),
            readFile(cfg.IN_SERVER_KEY_PATH)
        ]);

        //read outbound certs/keys
        [config.tls.outboundCreds.ca, config.tls.outboundCreds.cert, config.tls.outboundCreds.key] = await Promise.all([
            readFilesDelimitedList(',', cfg.OUT_CA_CERT_PATH),
            readFile(cfg.OUT_CLIENT_CERT_PATH),
            readFile(cfg.OUT_CLIENT_KEY_PATH)
        ]);
    }

    config.validateInboundJws = parseBoolean(cfg.VALIDATE_INBOUND_JWS)
    config.jwsSign = parseBoolean(cfg.JWS_SIGN)
    // config.jwsSigningKey = await readFile(cfg.JWS_SIGNING_KEY_PATH);
    config.jwsVerificationKeysDirectory = cfg.JWS_VERIFICATION_KEYS_DIRECTORY;

    config.jwsVerificationKeys = {};

    // fs.readdirSync(cfg.JWS_VERIFICATION_KEYS_DIRECTORY)
    //     .filter(f => f.endsWith('.pem'))
    //     .map(f => {
    //         config.jwsVerificationKeys[path.basename(f, '.pem')] = fs.readFileSync(path.join(cfg.JWS_VERIFICATION_KEYS_DIRECTORY, f));
    //     });

    config.cacheConfig.host = cfg.CACHE_HOST;
    config.cacheConfig.port = cfg.CACHE_PORT;

    config.enableTestFeatures = parseBoolean(cfg.ENABLE_TEST_FEATURES)

    config.wso2BearerToken = cfg.WS02_BEARER_TOKEN;
    
    //Adds the host header to all mojaloop requests for nice routing
    config.addHostHeader = true;
};


const getConfig = () => {
    return config;
};


module.exports = {
    getConfig,
    setConfig
};
