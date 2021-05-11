import { pathToSHA512 } from 'file-to-sha512';
import fs from 'fs';
import alert from '../utils/alert';
import hash_table from './hash-table';
import ipc from 'node-ipc';

let IDS_Hash_Table = new hash_table();
ipc.config.id = "File-Integrity-Monitor";
ipc.config.retry = 1500;
ipc.config.silent = true;

let PID : NodeJS.Timeout;

ipc.serve(()=>{
    ipc.server.on("start", ()=>{
        PID = setInterval(checkSumFiles, 5000);
    });

    ipc.server.on("pause", ()=>{
        clearInterval(PID);
    });

    ipc.server.on("add", async (file,socket) => {
        
        ipc.server.emit(socket,await IDS_Hash_Table.insert(file, await pathToSHA512))
    });
});

async function checkSumFiles(){
    const table = await IDS_Hash_Table.getHashTable();
    for(let [file, hash] of table){
        if(!(fs.existsSync(file) && fs.statSync(file).isFile())){
            alert(`File Integrity Monitor Alert: ${file} renamed or removed`);
            IDS_Hash_Table.remove(file);
            continue;
        }
        let newHash = await pathToSHA512(file);
        if(hash === newHash) continue;
        alert(`File Integrity Monitor Alert: ${file} modified`);
        IDS_Hash_Table.update(file,newHash);
    }
}

ipc.server.start();