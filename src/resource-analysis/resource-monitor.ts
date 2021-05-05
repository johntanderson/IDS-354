import si, { Systeminformation } from 'systeminformation'
import fs from 'fs';
import Queue from '../utils/queue'

const cpuQueue = new Queue(10);
const memoryQueue = new Queue(10);
const processQueue = new Queue(10);

function collectSystemInfo(){
    let promises : Promise<Systeminformation.CurrentLoadData | Systeminformation.MemData | Systeminformation.ProcessesData>[] = [];
    promises.push(si.currentLoad());
    promises.push(si.mem());
    promises.push(si.processes());

    Promise.all(promises).then((values : [Systeminformation.CurrentLoadData, Systeminformation.MemData, Systeminformation.ProcessesData])=>{
        let event = new Date(Date.now())
        fs.appendFile('./output/resource-usage.csv',`${event.toISOString()},${values[0].currentLoad},${values[1].active},${values[2].all}\n`, (err)=>{alert([values[0].currentLoad, values[1].active, values[2].all], event.toISOString() ,err)})
    });
}

function alert(values : [number, number, number], timestamp: string, err : NodeJS.ErrnoException){
    if(err) console.error(err)
    cpuQueue.enqueue(values[0]);
    memoryQueue.enqueue(values[1]);
    processQueue.enqueue(values[2]);
    if(!(cpuQueue.isFull() && memoryQueue.isFull() && processQueue.isFull())) return;
    if(cpuQueue.getDeviation()>=33){
        fs.appendFile('./output/alerts.csv', `ALERT: CPU Utilization Deviation Above Threshold\n`, (err)=> console.error(err));
    }
    if(memoryQueue.getDeviation()>=33){
        fs.appendFile('./output/alerts.csv', `ALERT: Used Memory Deviation Above Threshold\n`, (err)=> console.error(err));
    }
    if(processQueue.getDeviation()>=33){
        fs.appendFile('./output/alerts.csv', `ALERT: Active Processes Deviation Above Threshold\n`, (err)=> console.error(err));
    }
}

let id = setInterval(collectSystemInfo, 20000);

setTimeout(()=>{
    clearInterval(id);
}, 600000);

