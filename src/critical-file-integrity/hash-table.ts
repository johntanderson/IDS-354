import env from '../utils/env'
import db from '../utils/db'
import { QueryOptions } from 'mariadb';

interface DB_Response {
    file: string,
    hash: string
}

const IDS_DB = new db({
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT as string) || 3306,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB
}); 

export default class {

    async update(file:string, newHash:string):Promise<boolean>{
        let query : [string | QueryOptions, any] = [
            {namedPlaceholders: true, sql: "UPDATE HashTable SET hash = :hash WHERE file = :file"},
            {file: file, hash: newHash}
        ]
        try {
            await IDS_DB.query(query);
            return true;
        } catch (error) {
            return false;
        }
    }

    async insert(file: string, hash: string):Promise<boolean>{
        let query : [string | QueryOptions, any] = [
            {namedPlaceholders: true, sql: "INSERT INTO HashTable VALUE (:file, :hash)"},
            {file: file, hash}
        ]
        try {
            await IDS_DB.query(query);
            return true;
        } catch (error) {
            return false;
        }
    }

    async remove(file: string):Promise<boolean>{
        try {
            let query : [string | QueryOptions, any] = [
                {namedPlaceholders: true, sql: "DELETE FROM HashTable WHERE file = :file"},
                {file: file.toString()}
            ]
            await IDS_DB.query(query);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getFiles(){
        try {
            let query : [string | QueryOptions, any] = ["SELECT file FROM HashTable",{}]
            return await IDS_DB.query(query);
        } catch (error) {
            return undefined;
        }
    }

    async getHashTable() : Promise<Map<string,string>> {
        let hashTable : Map<string,string> = new Map();
        let res : DB_Response[]
        try {
            let query : [string | QueryOptions, any] = ["SELECT * FROM HashTable",{}]
            res = await IDS_DB.query(query);
            res.forEach(({file, hash},) => {
                hashTable.set(file, hash)
            });
        } catch (error) {}
        return hashTable;
    }

}