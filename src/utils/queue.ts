class Queue {
    elements : number[] = [];
    capacity : number;
    constructor(capacity : number){
        this.capacity = capacity;
    }

    enqueue = (e : number) => {
        if(this.elements.length === this.elements.length){
            this.dequeue();
        }
        this.elements.push(e);
    }

    dequeue = (): number  => {
        return this.elements.shift();
    }

    getDeviation = (): number => {
        let mean: number = 0;
        let sqauredDifferences: number[] = [];
        let squaredDiffMean: number = 0;
        this.elements.forEach((number)=>{
            mean += number;
        });
        mean = mean / this.elements.length;
        this.elements.forEach((number)=>{
            sqauredDifferences.push(Math.pow((number-mean),2));
        });
        sqauredDifferences.forEach((number)=>{
            squaredDiffMean += number;
        });
        squaredDiffMean = squaredDiffMean / sqauredDifferences.length;
        return Math.sqrt(squaredDiffMean);
    }

    isFull = (): boolean =>{
        return this.elements.length === this.capacity;
    }
}

export default Queue;