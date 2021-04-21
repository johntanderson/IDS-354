import TailFile from '@logdna/tail-file';
import split2 from 'split2';
import grokJS, { GrokPattern } from 'grok-js';
import { PathLike } from 'fs';

export interface config {
    path: string,
    patterns: string[],
    type : "system" | "application",
    callback: CallableFunction
}

export default class log {
    path : PathLike;
    patterns : GrokPattern[] = [];
    tail : TailFile;
    type : "system" | "application"
    callback: CallableFunction;

    constructor(config:config){
        this.path = config.path;
        this.type = config.type;
        this.callback = config.callback;
        grokJS.loadDefault((err,grokPatterns)=>{
            config.patterns.forEach(pattern => {
                this.patterns.push(grokPatterns.createPattern(pattern));
            })
        })
        this.tail = new TailFile(this.path.toString());
        this.tail.pipe(split2()).on('data', (line)=>{
            this.patterns.forEach((pattern) => {
                pattern.parse(line, (err,obj)=>{
                    if(err) return;
                    if(obj) {
                        let result = {
                            type: this.type,
                            event: obj
                        }
                        this.callback(result);
                    }
                })
            })
        })
        this.tail.start();
    }
}

