/*
 * ISC License
 *
 * Copyright (c) 2018 Philipp Voß
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 */

import {RowDataPacket, Pool} from 'mysql2';
import {Room} from "../../Models/Room";
import RoomRepositoryInterface from "../RoomRepositoryInterface";
import {Client} from "../../Models/Client";

export class RoomRepository implements RoomRepositoryInterface{

    private dbHandler: Pool = {} as Pool;

    constructor(connection: Pool) {
        this.dbHandler = connection;
    }

    async getPublicRooms(): Promise<Room[]> {
        // let client = new Client();
        let result: any = await this.query(`SELECT roomId, name, description, entryMessage FROM chatRooms WHERE isHidden = 0`, []);
        console.log(result);
        return Promise.resolve([]);
        // client.userId = result.id_admin;
        // client.username = result.username;
        // client.role = result.isAdmin ? 'admin' : 'user';
        // return client;
    }

    async getRoomsByUserId(userId: number): Promise<Room[]> {
        return Promise.resolve([]);
    }

    async query(sql: string, params: string[]) {
        return new Promise(
            (resolve, reject) => {
                this.dbHandler.execute(sql, params, (err, result: RowDataPacket[][]) => {
                    if (err) {
                        console.log(sql);
                        return reject(err);
                    }
                    resolve(result[0]);
                })
            }
        )
    }
};