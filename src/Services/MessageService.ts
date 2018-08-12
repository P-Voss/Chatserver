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

import {Client} from "../Models/Client";
import {ResponseTypes} from "../Models/DataTypes/ResponseTypes";

import bootstrap from "./../Bootstrap";
import ClientServiceInterface from "./ClientServiceInterface";
import RoomServiceInterface from "./RoomServiceInterface";


export default class MessageService {

    private clientService: ClientServiceInterface;
    private roomService: RoomServiceInterface;

    constructor(clientService: ClientServiceInterface, roomService: RoomServiceInterface) {
        this.clientService = bootstrap.getClientService();
        this.roomService = bootstrap.getRoomService();
    }

    static sendMessage(client: Client, messageObject: object) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(messageObject));
        }
    }

    sendRoomlist() {
        const roomlist = {
            messageType: ResponseTypes.ROOMLIST,
            payload: this.roomService.getRoomlistForMessage()
        };
        for (let admin of this.clientService.getAdmins()) {
            MessageService.sendMessage(admin, roomlist);
        }
    }


    sendRoomMessage(roomId: number, message: string, sender: Client) {
        const roomMessage = {
            messageType: ResponseTypes.MESSAGE,
            payload: {
                sender: sender.username,
                message: message
            }
        };
        this.roomService.getRoomClients(roomId).forEach((client: Client) => {
            MessageService.sendMessage(client, roomMessage);
        });
    }

    sendSystemMessage(roomId: number, message: string): void {
        const systemMessage = {
            messageType: ResponseTypes.MESSAGE,
            payload: {
                sender: 'System',
                message: message
            }
        };
        this.roomService.getRoomClients(roomId).forEach((client: Client) => {
            MessageService.sendMessage(client, systemMessage);
        });
    }

}
