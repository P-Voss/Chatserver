/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */

import {Room} from '../Models/Room';
import {Client} from '../Models/Client';

export default interface RoomServiceInterface {

    createRoom(roomId: number, client: Client): void;

    roomExists(roomId: number): boolean;

    getRoomlistForMessage(): Room[];

    refreshRoomParticipants(roomId: number, client: Client): void;

    enterRoom(client: Client, roomId: number, callback: () => void): void;

    leaveRoom(userId: number, roomId: number, callback: () => void): void;

    getRoomClients(roomId: number): Client[];

    deleteRoomIfEmpty(roomId: number, callback: () => void): void;
}
