import mariadb, { ConnectionConfig, QueryOptions, Connection } from 'mariadb';

export default class db {
    config : ConnectionConfig;
    constructor(config : ConnectionConfig){
        this.config = config
    }

    async query([sql, values = undefined] : [string | QueryOptions, any]) : Promise<any> {
        let conn : Connection;
        let result : any;
        try {
            conn = await mariadb.createConnection(this.config);
            result = await conn.query(sql, values);
            conn.end();
            return result;
        } catch (error) {
            conn.end();
            throw error;
        }
    }

}