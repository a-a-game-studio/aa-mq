
import ip from 'ip'
import { MsgContext } from './MqContext';

/** информация по сообщению */
export interface MsgInfoI{
    send_time?:number,
    send_ip?:string,
    ask_time?:number,
    ask_ip?:string,
    work_time?:number,
    work_ip?:string
}

/** информация по сообщению */
export interface QueueInfoI{
    count:number, // Количество необработанных сообщений в очереди
    ip:string, // IP 
    ask_speed:number, // скорость в секунду
    work_speed:number, // скорость в секунду
    send_speed:number, // скорость в секунду
}

/** Компонент Очередь */
export class MqQueueC {
    ixMsg:Record<number, any> = {};
    ixInfo:Record<number, MsgInfoI> = {};

    ip:''; // IP адрес очереди
    iQueDel = 0; // Курсон удаленных сообщений
    iQueSpeed = 0; // Курсор сообщений для расчета статистики за последнюю минуту
    iQueStartDb = 0; // Курсор сообщений перенесенных в БД
    iQueStart = 0; // Курсор необработанных сообщений
    iQueEnd = 0; // Курсор конца сообщений

    /** Получить значение из очереди */
    public get(msg:MsgContext){
        let iQueStart = 0;
        if(this.iQueEnd > this.iQueStart){
            iQueStart = ++this.iQueStart;
        }

        console.log(iQueStart,this.ixMsg[iQueStart])

        const data = this.ixMsg[iQueStart];

        this.ixInfo[iQueStart] = {
            ask_time: Date.now(),
            ask_ip: msg.ip
        }
    
        return data;
    
    }

    /** Поместить значение в очередь */
    public set(msg:MsgContext){
        const iQueEnd = ++this.iQueEnd;
    
        this.ixMsg[iQueEnd] = msg.data;

        this.ixInfo[iQueEnd] = {
            send_time: Date.now(),
            send_ip: msg.ip
        }
    }

    /** Поместить значение в очередь */
    public count(){
        return this.iQueEnd - this.iQueStart;
    }

    /** Получить информацию по очереди */
    public info(): QueueInfoI{

        const vQueueInfo:QueueInfoI = <any>{};
        vQueueInfo.count = this.iQueEnd - this.iQueStart;
        vQueueInfo.ip = ip.address();
        vQueueInfo.ask_speed = 0; // Скорость в секунду
        vQueueInfo.work_speed = 0; // скорость в секунду
        vQueueInfo.send_speed = 0; // скорость в секунду

        return vQueueInfo;
    }
}

/** Система очередей */
export class MqServerSys {
    public ixQueue:Record<string, MqQueueC> = {};

    /** Получить из очереди */
    public get(msg:MsgContext){
        
        if(!this.ixQueue[msg.queue]){
            this.ixQueue[msg.queue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[msg.queue];
        
        return vMqQueueC.get(msg);
    
        
    }
    
    /** Поместить значение в очередь */
    public set(msg:MsgContext){
        if(!this.ixQueue[msg.queue]){
            this.ixQueue[msg.queue] = new MqQueueC();
        }


        const vMqQueueC = this.ixQueue[msg.queue];

        vMqQueueC.set(msg)
    }

    /** Получить количество сообщений в очереди */
    public count(sQue:string){
        if(!this.ixQueue[sQue]){
            this.ixQueue[sQue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[sQue];

        return vMqQueueC.count();
    }

    /** Получить информацию по очереди */
    public info(sQue:string): QueueInfoI{

        if(!this.ixQueue[sQue]){
            this.ixQueue[sQue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[sQue];

        return vMqQueueC.info();
    }
}