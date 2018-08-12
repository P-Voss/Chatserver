/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */
import * as WebSocket from 'ws';


import {Request} from "../Models/Request";
import {Client} from "../Models/Client";

export default interface ConnectionHandlerInterface {

    onConnect(socket: WebSocket): Client;

    onMessage(client: Client, request: Request): void;

    onClose(client: Client): void;

}