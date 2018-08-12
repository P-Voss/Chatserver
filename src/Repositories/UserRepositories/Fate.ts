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
import {Client} from '../../Models/Client';

const SUPPORT_GROUP_ID = 1337;

export class UserRepository {

    private dbHandler: Pool = {} as Pool;

    constructor(connection: Pool) {
        this.dbHandler = connection;
    }

    async getUserByAccessKey(access_key: string): Promise<Client> {
        let client = new Client();
        let result: any = await this.query(
            `SELECT benutzerdaten.userId, benutzerdaten.profilname, admins.userId IS NOT NULL AS isAdmin 
            FROM chatAccessKeys 
            INNER JOIN benutzerdaten USING (userId) 
            LEFT JOIN admins USING (userId) 
            WHERE chatAccessKeys.accessKey = ?`,
            [access_key]
        );
        client.userId = result.id_admin;
        client.username = result.profilname;
        client.role = result.isAdmin ? 'admin' : 'user';
        return client;
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