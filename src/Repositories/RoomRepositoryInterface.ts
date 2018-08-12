/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */

import {Room} from "../Models/Room";

interface RoomRepositoryInterface {
    getRoomsByUserId(userId: number): Promise<Room[]>;
    getPublicRooms(): Promise<Room[]>;
}

export default RoomRepositoryInterface;