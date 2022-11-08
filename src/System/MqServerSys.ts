
/** Компонент Очередь */
export class MqQueueC {
    ixMsg:Record<number, any> = {};

    iQueStartDb = 0;
    iQueStart = 0;
    iQueEnd = 0;

    /** Получить значение из очереди */
    public get(){
        let iQueStart = 0;
        if(this.iQueEnd > this.iQueStart){
            iQueStart = this.iQueStart++;
        }

        const data = this.ixMsg[iQueStart];
        delete this.ixMsg[iQueStart];
    
        return data;
    
    }

    /** Поместить значение в очередь */
    public set(data:any){
        const iQueEnd = this.iQueEnd++
    
        this.ixMsg[iQueEnd] = data;
    }
}

/** Система очередей */
export class MqServerSys {
    public ixQueue:Record<string, MqQueueC> = {};

    /** Получить из очереди */
    public get(sQue:string){
        
        if(!this.ixQueue[sQue]){
            this.ixQueue[sQue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[sQue];
        
        return vMqQueueC.get();
    
        
    }
    
    /** Поместить значение в очередь */
    public set(sQue:string, data:any){
        if(!this.ixQueue[sQue]){
            this.ixQueue[sQue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[sQue];

        vMqQueueC.set(data)
    }
}