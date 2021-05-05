import log, { config } from './log';
import fs from 'fs';

let logConfigs : config[] = JSON.parse(fs.readFileSync('./src/log-parser/config.json', 'utf-8'));
const logLib : log[] = [];
const applicationEvents = fs.createWriteStream('./src/log-parser/events/application.csv',{flags:'a'});
const systemEvents = fs.createWriteStream('./src/log-parser/events/system.csv',{flags:'a'});

logConfigs.forEach((config)=>{
    config.callback = writeToCSV;
    logLib.push(new log(config));
})

function writeToCSV({type, event}){
    let writer = type === "system" ? systemEvents : applicationEvents;
    writer.write(`${event.subject},${event.action},${event.object},${event.timestamp}\n`);
    writer.close();
}