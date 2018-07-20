import {createPool, Pool} from "mysql2";
import {Server} from 'ws';
import {createLogger, transports, Logger } from 'winston';

import {createServer} from 'https';
const express = require('express');
const fs = require('fs');

import UserRepoFactory from './src/Repositories/UserRepositories/Factory';
import ClientServiceFactory from './src/Services/ClientServices/Factory';
import RoomServiceFactory from './src/Services/RoomServices/Factory';

import ClientServiceInterface from "./src/Services/ClientServiceInterface";
import RoomServiceInterface from "./src/Services/RoomServiceInterface";

const config = require('./src/config/config');

function initWss(): Server {
    if (config.serverConfig.ssl) {

        const privateKey = fs.readFileSync(config.serverConfig.ssl_key, 'utf8');
        const certificate = fs.readFileSync(config.serverConfig.ssl_cert, 'utf8');
        const credentials = {key: privateKey, cert: certificate};
        const app = express();

        const httpsServer = createServer(credentials, app);
        httpsServer.listen(config.serverConfig.port);
        return new Server({
            server: httpsServer
        });
    } else {
        return new Server({port: config.serverConfig.port});
    }
}

function initDb(): Pool {
    return createPool(config.mysqlConfig);
}

function initLogger(): Logger {
    return createLogger({
        transports: [
            new transports.Console(),
        ]
    })
}

class Bootstrap {
    private db: Pool | undefined;
    private wss: Server | undefined;
    private logger: Logger | undefined;

    getDb(): Pool {
        if (this.db === undefined) {
            this.db = initDb();
        }
        return this.db;
    }
    getWss(): Server {
        if (this.wss === undefined) {
            this.wss = initWss();
        }
        return this.wss;
    }
    getLogger(): Logger {
        if (this.logger === undefined) {
            this.logger = initLogger();
        }
        return this.logger;
    }
    getClientService(): ClientServiceInterface {
        const userRepo = UserRepoFactory(config.chatModule, this.getDb());
        return ClientServiceFactory(config.chatModule, userRepo);
    }
    getRoomService(): RoomServiceInterface {
        return RoomServiceFactory(config.chatModule);
    }
};

export default new Bootstrap();