/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */

import {createPool, Pool} from "mysql2";
import {Server} from 'ws';
import {createLogger, transports, Logger} from 'winston';

import {createServer} from 'https';

const express = require('express');
const fs = require('fs');

import UserRepoFactory from './Repositories/UserRepositories/Factory';
import RoomRepoFactory from './Repositories/RoomRepositories/Factory';
import ClientServiceFactory from './Services/ClientServices/Factory';
import RoomServiceFactory from './Services/RoomServices/Factory';
import ConnectionHandlerFactory from './Services/ConnectionHandlers/Factory';

import ClientServiceInterface from "./Services/ClientServiceInterface";
import RoomServiceInterface from "./Services/RoomServiceInterface";
import ConnectionHandlerInterface from "./Services/ConnectionHandlerInterface";

import MessageService from "./Services/MessageService";

const config = require('./config/config');

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
        const roomRepo = RoomRepoFactory(config.chatModule, this.getDb());
        return RoomServiceFactory(config.chatModule, roomRepo);
    }
    getMessageService(): MessageService {
        return new MessageService(
            this.getClientService(),
            this.getRoomService()
        );
    }
    getConnectionHandler(): ConnectionHandlerInterface {
        return ConnectionHandlerFactory(config.chatModule);
    }
}

const bootstrap = new Bootstrap();

export default bootstrap;