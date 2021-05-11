import fs from 'fs';

function alert(message: string){
    fs.appendFile('./output/alerts.csv', `${message} @ ${new Date(Date.now()).toISOString()}\n`, (err)=> {});
}

export default alert;