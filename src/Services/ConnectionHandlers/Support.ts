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
import bootstrap from "../../Bootstrap";

import RoomServiceInterface from '../RoomServiceInterface'
import ClientServiceInterface from '../ClientServiceInterface'

import {Client} from '../../Models/Client';
import {Request} from "../../Models/Request";
import {RequestTypes} from "../../Models/DataTypes/RequestTypes";
import {ResponseTypes} from "../../Models/DataTypes/ResponseTypes";

import MessageService from "../MessageService";

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
                this.ClientService.addClientData(request.payload.access_key, client.clientUuid)
                    .then(
                        (client) => {
                            if (client.role === 'admin') {
                                this.handleAdminConnected(client);
                            } else {
                                this.handleUserConnected(client);
                            }
                        }
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
        this.RoomService.leaveRoom(
            client.userId,
            client.currentRoomId,
            () => this.messageService.sendSystemMessage(client.currentRoomId, client.username + " hat den Chat verlassen.")
        );
        this.RoomService.deleteRoomIfEmpty(
            client.currentRoomId,
            () => this.messageService.sendRoomlist()
        );
        this.ClientService.removeClient(client.clientUuid);
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
        client.currentRoomId = client.userId;
        this.ClientService.updateClient(client.clientUuid, client);

        if (this.RoomService.roomExists(client.userId)) {
            this.RoomService.refreshRoomParticipants(client.userId, client);
        } else {
            this.RoomService.createRoom(client.userId, client);
        }

        MessageService.sendMessage(client, {messageType: ResponseTypes.ACK_INIT,
            payload: {
                message: "Sie wurden mit dem Chat verbunden. Ein Support-Mitarbeiter wird Ihnen gleich helfen.",
                roomId: client.userId,
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