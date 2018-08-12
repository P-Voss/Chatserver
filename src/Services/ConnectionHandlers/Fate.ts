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

import ConnectionHandlerInterface from "../ConnectionHandlerInterface";
import Bootstrap from "./../../Bootstrap";

import RoomServiceInterface from '../RoomServiceInterface'
import ClientServiceInterface from '../ClientServiceInterface'

import {Client} from '../../Models/Client';
import {Request} from "../../Models/Request";
import {RequestTypes} from "../../Models/DataTypes/RequestTypes";
import {ResponseTypes} from "../../Models/DataTypes/ResponseTypes";

import MessageService from "../MessageService";
import bootstrap from "../../Bootstrap";

export class ConnectionHandler implements ConnectionHandlerInterface{

    private RoomService: RoomServiceInterface;
    private ClientService: ClientServiceInterface;
    private messageService: MessageService;

    constructor() {
        this.RoomService = bootstrap.getRoomService();
        this.ClientService = bootstrap.getClientService();
        this.messageService = bootstrap.getMessageService();
    }

    onConnect(socket: WebSocket): Client {
        return this.ClientService.createClient(socket);
    }

    onMessage(client: Client, request: Request): void {
        switch (request.messageType) {

            case RequestTypes.INIT:
                if (this.ClientService.clientAlreadyConnected(client.userId)) {

                } else {

                }
                this.ClientService.addClientData(request.payload.access_key, client.clientUuid)
                    .then(
                        (client) => this.handleUserConnected(client)
                    ).catch(
                    (error) => {
                        this.handleInvalidUser(client);
                        console.log(error);
                    }
                );
                break;

            case RequestTypes.MESSAGE:
                this.messageService.sendRoomMessage(request.payload.currentRoomId, request.payload.message, client);
                break;

            case RequestTypes.SWITCH_ROOM:
                client.currentRoomId = request.payload.nextRoomId;
                this.ClientService.updateClient(client.clientUuid, client);

                this.RoomService.leaveRoom(
                    client.userId,
                    request.payload.currentRoomId,
                    () => this.messageService.sendSystemMessage(request.payload.currentRoomId, client.username + " hat den Chat verlassen.")
                );
                this.RoomService.enterRoom(
                    client,
                    request.payload.nextRoomId,
                    () => this.messageService.sendSystemMessage(request.payload.nextRoomId, client.username + " chattet jetzt.")
                );
                this.RoomService.deleteRoomIfEmpty(
                    request.payload.currentRoomId,
                    () => this.messageService.sendRoomlist()
                );
                break;
        }
    }

    onClose(client: Client): void {

    }


    private handleInvalidUser(client: Client): void {
        MessageService.sendMessage(client, {messageType: ResponseTypes.DENIED,
            payload: {
                message: "Ihnen fehlt die Berechtigung den Chat zu nutzen."
            }
        });
    }

    private handleAdminConnected(client: Client): void {
        this.ClientService.addAdmin(client);
        MessageService.sendMessage(client, {
            messageType: ResponseTypes.ACK_INIT,
            payload: {
                role: client.role
            }
        });
        MessageService.sendMessage(client, {
            messageType: ResponseTypes.ROOMLIST,
            payload: this.RoomService.getRoomlistForMessage()
        });
    }

    private handleUserConnected(client: Client): void {
        client.currentRoomId = 0;
        this.ClientService.updateClient(client.clientUuid, client);

        this.RoomService.refreshRoomParticipants(0, client);

        MessageService.sendMessage(client, {messageType: ResponseTypes.ACK_INIT,
            payload: {
                message: "Willkommen im Chat! Be nice, have fun.",
                roomId: 0,
                role: client.role
            }
        });
        /**
         * Bestätigung fürs Betreten des Chats an den User senden
         */
        this.messageService.sendSystemMessage(client.currentRoomId, client.username + " chattet jetzt.");
        /**
         * Admins die aktualisierten Räume schicken
         */
        this.messageService.sendRoomlist();
    }
}