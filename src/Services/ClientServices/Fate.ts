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

import * as uuid from 'uuid';

import ClientServiceInterface from '../ClientServiceInterface'

import {Client} from '../../Models/Client';
import UserRepositoryInterface from '../../Repositories/UserRepositoryInterface';


export class ClientService implements ClientServiceInterface {

    private clientRepository: UserRepositoryInterface;

    private clients: Map<string, Client>;
    private admins: Client[] = [];

    constructor(userRepositoy: UserRepositoryInterface) {
        this.clients = new Map();
        this.clientRepository = userRepositoy;
    }

    createClient(socket: WebSocket): Client {
        let client = new Client();
        client.ws = socket;
        client.clientUuid = uuid.v4();
        this.clients.set(client.clientUuid, client);
        return client;
    }

    clientAlreadyConnected(userId: number): boolean {
        let alreadyConnected = false;

        this.clients.forEach((client: Client, key: string) => {
            if (client.userId === userId) {
                alreadyConnected = true;
            }
        });
        return alreadyConnected;
    }

    async addClientData(clientAccessKey: string, clientUuid: string): Promise<Client> {
        let client = this.clients.get(clientUuid);
        if (client === undefined) {
            throw new Error();
        }
        let clientData = await this.clientRepository.getUserByAccessKey(clientAccessKey);
        if (this.clientAlreadyConnected(clientData.userId)) {
            throw new Error();
        }

        client.userId = clientData.userId;
        client.username = clientData.username;
        client.role = clientData.role;
        return client;
    }

    getClientByUUID(clientUuid: string): Client {
        const client = this.clients.get(clientUuid);
        if (client !== undefined) {
            return client;
        } else {
            throw new Error('Client existiert nicht!');
        }
    }

    addAdmin(client: Client) {
        this.admins.push(client);
    }

    getAdmins(): Client[] {
        return this.admins;
    }

    updateClient(clientUuid: string, client: Client) {
        this.clients.set(clientUuid, client);
    }

    removeClient(clientUuid: string) {
        this.clients.delete(clientUuid);
        this.admins = this.admins.filter((client: Client) => {
            if (client.clientUuid !== clientUuid) {
                return client;
            }
        });
    }

}