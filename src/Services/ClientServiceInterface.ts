/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */

import * as uuid from "uuid";
import {Client} from "../Models/Client";
import WebSocket = require('ws');

export default interface ClientServiceInterface {

    createClient(socket: WebSocket): Client;

    clientAlreadyConnected(userId: number): boolean;

    addClientData(clientAccessKey: string, clientUuid: string): Promise<Client>;

    getClientByUUID(clientUuid: string): Client;

    addAdmin(client: Client): void;

    getAdmins(): Client[];

    updateClient(clientUuid: string, client: Client): void;

    removeClient(clientUuid: string): void;
}
