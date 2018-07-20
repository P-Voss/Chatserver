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
            `SELECT admins.id_admin, admins.username, berechtigung.id_user IS NOT NULL AS isAdmin 
            FROM modul_chat_access_keys 
            INNER JOIN admins USING (id_admin) 
            LEFT JOIN ber_userGruppeZuo AS berechtigung 
            ON berechtigung.id_user = admins.id_admin AND berechtigung.id_ber_gruppe = ${SUPPORT_GROUP_ID} AND berechtigung.status = "A" 
            WHERE modul_chat_access_keys.access_key = ?`,
            [access_key]
        );
        client.userId = result.id_admin;
        client.username = result.username;
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