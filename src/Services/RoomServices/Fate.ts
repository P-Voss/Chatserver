/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */

import {Room} from '../../Models/Room';
import {Client} from '../../Models/Client';

import RoomServiceInterface from '../RoomServiceInterface'
import RoomRepositoryInterface from "../../Repositories/RoomRepositoryInterface";
import UserRepositoryInterface from "../../Repositories/UserRepositoryInterface";

export class RoomService implements RoomServiceInterface{

    private rooms: Map<number, Room> = new Map();
    private roomRepository: RoomRepositoryInterface;

    constructor(roomRepository: RoomRepositoryInterface) {
        this.roomRepository = roomRepository;
        this.roomRepository.getPublicRooms();
    }

    createRoom(roomId: number, client: Client) {
        let room = new Room(roomId, client.username);
        room.participants.push(client);
        this.rooms.set(roomId, room);
    }

    roomExists(roomId: number):boolean {
        return this.rooms.has(roomId);
    }

    /**
     * Push-Nachricht mit aktuellen Status der Chatrooms für die Admins vorbereiten
     *
     * Maps können nicht per WebSocket JSON encodet werden, deshalb wird der zu übertragende Inhalt in ein neues Array geschrieben.
     * WS wird aus dem Einträgen von Participants nicht übernommen weil die WebSocket-Informationen nicht übertragen werden sollen
     */
    getRoomlistForMessage(): Room[] {
        let messageRooms: Room[] = [];
        this.rooms.forEach((room: Room) => {
            let messageRoom = new Room(room.roomId, room.roomName);
            room.participants.forEach((client) => {
                let newClient = new Client(client.userId, client.username, client.role);
                messageRoom.addParticipants(newClient);
            });
            messageRooms.push(messageRoom);
        });
        return messageRooms;
    }

    refreshRoomParticipants(roomId: number, client: Client) {
        let room = this.rooms.get(roomId);
        if (room !== undefined) {
            let alreadyInRoom = false;
            room.participants = room.participants.map((participant: Client) => {
                if (participant.userId == client.userId) {
                    alreadyInRoom = true;
                    participant.ws = client.ws;
                }
                return participant;
            });
            if (!alreadyInRoom) {
                room.participants.push(client);
            }
            this.rooms.set(roomId, room);
        } else {
            console.log('Raum existiert nicht! method: refreshRoomParticipants');
        }
    }

    enterRoom(client: Client, roomId: number, callback: () => void) {
        let room = this.rooms.get(roomId);
        if (room !== undefined) {
            var alreadyInRoom = false;
            room.participants = room.participants.map((participant: Client) => {
                if (participant.userId == client.userId) {
                    participant.ws = client.ws;
                    alreadyInRoom = true;
                }
                return participant;
            });
            if (!alreadyInRoom) {
                room.participants.push(client);
            }
            callback();
        }
    }

    leaveRoom(userId: number, roomId: number, callback: () => void) {
        let room = this.rooms.get(roomId);
        if (room !== undefined) {
            room.participants = room.participants.filter((client: Client) => client.userId !== userId);
            callback();
        }
    }

    getRoomClients(roomId: number): Client[] {
        let room = this.rooms.get(roomId);
        if (room !== undefined) {
            return room.participants;
        } else {
            return [];
        }
    }

    deleteRoomIfEmpty(roomId: number, callback: () => void): void {
        let room = this.rooms.get(roomId);
        if (room !== undefined) {
            if (room.participants.length === 0) {
                this.rooms.delete(roomId);
                callback();
            }
        }
    }

}