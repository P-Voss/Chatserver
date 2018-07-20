import * as WebSocket from 'ws';

import {RequestTypes} from './Models/DataTypes/RequestTypes';
import {ResponseTypes} from './Models/DataTypes/ResponseTypes';
import {Client} from './Models/Client';
import {Request} from './Models/Request';
import Bootstrap from '../Bootstrap'

const wss = Bootstrap.getWss();
const pool = Bootstrap.getDb();
const logger = Bootstrap.getLogger();
const clientService = Bootstrap.getClientService();
const roomService = Bootstrap.getRoomService();

wss.on("connection", function (socket: WebSocket) {

    let client = clientService.createClient(socket);

    socket.on("message", function (data: string) {

        const request = Request.fromJsonString(data);

        switch (request.messageType) {

            case RequestTypes.INIT:
                clientService.addClientData(request.payload.access_key, client.clientUuid)
                    .then(
                        (client) => {
                            if (client.role === 'admin') {
                                handleAdminConnected(client);
                            } else {
                                handleUserConnected(client);
                            }
                        }
                    ).catch(
                        (error) => {
                            handleInvalidUser(client);
                            logger.error(error);
                        }
                    );

                break;

            case RequestTypes.MESSAGE:
                sendRoomMessage(request.payload.currentRoomId, request.payload.message, client);
                break;

            case RequestTypes.SWITCH_ROOM:
                client.currentRoomId = request.payload.nextRoomId;
                clientService.updateClient(client.clientUuid, client);

                roomService.leaveRoom(
                    client.userId,
                    request.payload.currentRoomId,
                    () => sendSystemMessage(request.payload.currentRoomId, client.username + " hat den Chat verlassen.")
                );
                roomService.enterRoom(
                    client,
                    request.payload.nextRoomId,
                    () => sendSystemMessage(request.payload.nextRoomId, client.username + " chattet jetzt.")
                );
                roomService.deleteRoomIfEmpty(
                    request.payload.currentRoomId,
                    () => sendRoomlist()
                );
                break;
        }
    });

    socket.on("close", function () {
        logger.info("disconnect");
        roomService.leaveRoom(
            client.userId,
            client.currentRoomId,
            () => sendSystemMessage(client.currentRoomId, client.username + " hat den Chat verlassen.")
        );
        roomService.deleteRoomIfEmpty(
            client.currentRoomId,
            () => sendRoomlist()
        );
        clientService.removeClient(client.clientUuid);
    });
});

function sendRoomlist() {
    const roomlist = {
        messageType: ResponseTypes.ROOMLIST,
        payload: roomService.getRoomlistForMessage()
    };
    for (let admin of clientService.getAdmins()) {
        sendMessage(admin, roomlist);
    }
}

function handleInvalidUser(client: Client): void {
    console.log('denied');
    sendMessage(client, {messageType: ResponseTypes.DENIED,
        payload: {
            message: "Ihnen fehlt die Berechtigung den Chat zu nutzen."
        }
    });
}

function handleAdminConnected(client: Client): void {
    clientService.addAdmin(client);
    sendMessage(client, {
        messageType: ResponseTypes.ACK_INIT,
        payload: {
            role: client.role
        }
    });
    sendMessage(client, {
        messageType: ResponseTypes.ROOMLIST,
        payload: roomService.getRoomlistForMessage()
    });
}

function handleUserConnected(client: Client): void {
    client.currentRoomId = client.userId;
    clientService.updateClient(client.clientUuid, client);

    if (roomService.roomExists(client.userId)) {
        roomService.refreshRoomParticipants(client.userId, client);
    } else {
        roomService.createRoom(client.userId, client);
    }

    sendMessage(client, {messageType: ResponseTypes.ACK_INIT,
        payload: {
            message: "Sie wurden mit dem Chat verbunden. Ein Support-Mitarbeiter wird Ihnen gleich helfen.",
            roomId: client.userId,
            role: client.role
        }
    });
    /**
     * Bestätigung fürs Betreten des Chats an den User senden
     */
    sendSystemMessage(client.currentRoomId, client.username + " chattet jetzt.");
    /**
     * Admins die aktualisierten Räume schicken
     */
    sendRoomlist();
}


function sendMessage(client: Client, messageObject: object) {
    if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(messageObject));
    }
}


function sendRoomMessage(roomId: number, message: string, sender: Client) {
    const roomMessage = {
        messageType: ResponseTypes.MESSAGE,
        payload: {
            sender: sender.username,
            message: message
        }
    };
    roomService.getRoomClients(roomId).forEach((client: Client) => {
        sendMessage(client, roomMessage);
    });
}

function sendSystemMessage(roomId: number, message: string):void {
    const systemMessage = {
        messageType: ResponseTypes.MESSAGE,
        payload: {
            sender: 'System',
            message: message
        }
    };
    roomService.getRoomClients(roomId).forEach((client: Client) => {
        sendMessage(client, systemMessage);
    });
}