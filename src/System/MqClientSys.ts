import { QuerySys } from "@a-a-game-studio/aa-front";

import ip from 'ip'
import { MsgStrT } from "../Config/MainConfig";


export class MqClientSys {

    private querySys:QuerySys = null;

    constructor(conf:{
        baseURL: 'ws://127.0.0.1:8080',
    }){
        this.querySys = new QuerySys()
        this.querySys.fConfigWs(conf);
    }

    /**
	 * Отправить сообщение в очередь
	 * @param sQueue
	 * @param msg
	 */
	public send(sQueue: string, msg: any): void {
        this.querySys.fInit();
        this.querySys.fActionOk((data: any) => {
            // process.stdout.write('.');
            // console.log('[>>>Ответ<<<]');
            // console.log(data);
        });
        this.querySys.fActionErr((err:any) => {
            console.error(err);
        });
        this.querySys.fSend(MsgStrT.send, {
            ip:ip.address(),
            queue:sQueue,
            data:msg
        });
	}

    /** Запросить из очереди 
     * cb(data)
    */
    public ask(sQueue:string, cb:Function): void {
        this.querySys.fInit();
        this.querySys.fActionOk(cb);
        this.querySys.fActionErr((err:any) => {
            console.error(err);
        });
        this.querySys.fSend(MsgStrT.ask, {
            ip:ip.address(),
            queue:sQueue
        });
    }

    /** 
     * Количество сообщений в очереди
    */
    public count(sQueue:string, cb:Function): void {
        this.querySys.fInit();
        this.querySys.fActionOk(cb);
        this.querySys.fActionErr((err:any) => {
            console.error(err);
        });
        this.querySys.fSend(MsgStrT.count, {
            ip:ip.address(),
            queue:sQueue
        });
    }

    /** 
     * Информация об очереди
    */
    public info(sQueue:string, cb:Function): void {
        this.querySys.fInit();
        this.querySys.fActionOk(cb);
        this.querySys.fActionErr((err:any) => {
            console.error(err);
        });
        this.querySys.fSend(MsgStrT.info, {
            ip:ip.address(),
            queue:sQueue
        });
    }

}