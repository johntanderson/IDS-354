import { Command } from 'commander';
import env from '../utils/env'
import db from '../utils/db'
import { pathToSHA512 } from 'file-to-sha512';
import fs from 'fs';
import { PathLike } from 'node:fs';
import { QueryOptions } from 'mariadb';
import path from 'path';

const program = new Command();
const IDS_DB = new db({
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT as string) || 3306,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB
});

program.version('0.0.1');
program
    .option('-m, --monitor <files...>', 'Add file to file integrity monitor.')
    .option('-r, --remove <files...>', 'Remove file from integrity monitor.')
    .option('-l --list', 'List monitored files.')
    .parse();

let options = program.opts();

if(options.remove){
    options.remove.forEach((file : PathLike) => {
        removeFromHashTable(file);
    });
}

if(options.monitor){
    options.monitor.forEach((file : PathLike) => {
        insertIntoHashTable(file);
    });
}

if(options.list){
    getMonitoredFiles().then((files)=>{
        files.forEach(({file}) => {
            console.log(file);
        });
    });
}

async function insertIntoHashTable(file:PathLike) {
    try {
        if(!(fs.existsSync(file) && fs.statSync(file).isFile())){
            console.log(`File-Integrity-Client: File not found: ${file}`);
            return;
        }
        file = path.resolve(file.toString());
        let hash = await pathToSHA512(file as string);
        let query : [string | QueryOptions, any] = [
            {namedPlaceholders: true, sql: "INSERT INTO HashTable VALUE (:file, :hash)"},
            {file: file.toString(), hash}
        ]
        await IDS_DB.query(query);
        console.log(`File_Integrity-Client: ${file} is being monitored`);
    } catch (error) {
        console.log(`File_Integrity-Client: Error monitoring ${file}, is the file already being monitored?`);
    }
}

async function removeFromHashTable(file:PathLike){
    try {
        let query : [string | QueryOptions, any] = [
            {namedPlaceholders: true, sql: "DELETE FROM HashTable WHERE file = :file"},
            {file: file.toString()}
        ]
        await IDS_DB.query(query);
        console.log(`File_Integrity-Client: ${file} removed from monitor`);
    } catch (error) {
        console.log(`File_Integrity-Client: Error removing ${file} from monitor.`);
    }
}

async function getMonitoredFiles(){
    try {
        let query : [string | QueryOptions, any] = ["SELECT file FROM HashTable",{}]
        return await IDS_DB.query(query);
    } catch (error) {
        console.log("File-Integrity-Client: Error getting monitored files.");
    }
}