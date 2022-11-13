import { QuerySys } from "@a-a-game-studio/aa-front";
import e from "express";

import ip from 'ip'
import { MsgStrT } from "../Config/MainConfig";
import { mWait } from "../Helper/WaitH";


export class MqClientSys {

    private querySys:QuerySys = null;
    iSend:number = 0;
    iSendComplete:number = 0;
    iSendErr:number = 0;

    iLastTimeSend = Date.now();
    ixSendBuffer:Record<string, any[]> = {};
    iSendBufferCount = 0;

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

            this.iSendComplete++;
            
            // process.stdout.write('.');
            // console.log('[>>>Ответ<<<]');
            // console.log(data);
        });
        this.querySys.fActionErr((err:any) => {
            this.iSendErr++;
            console.error(err);
        });
        this.querySys.fSend(MsgStrT.send, {
            ip:ip.address(),
            queue:sQueue,
            data:msg
        });
        this.iSend++;
	}

    /**
	 * Отправить сообщение в очередь
	 * @param sQueue
	 * @param msg
	 */
	public sendBuffer(sQueue: string, msg: any): void {

        if(Date.now() - this.iLastTimeSend < 100){
            if(!this.ixSendBuffer[sQueue]){
                this.ixSendBuffer[sQueue] = [];
            }

            this.ixSendBuffer[sQueue].push({
                ip:ip.address(),
                queue:sQueue,
                data:msg
            });
            this.iSendBufferCount++;

            if(this.iSendBufferCount < 1000){
                return null;
            }
        }

        const ixSendBuffer = this.ixSendBuffer;
        this.ixSendBuffer = {}
        this.iSendBufferCount = 0;
        
        this.iLastTimeSend = Date.now();

        const akSendBuffer = Object.keys(ixSendBuffer);
        for (let i = 0; i < akSendBuffer.length; i++) {
            const kSendBuffer = akSendBuffer[i];
            const aMsg = ixSendBuffer[kSendBuffer]

            this.querySys.fInit();
            this.querySys.fActionOk((data: any) => {

                this.iSendComplete++;
                
                // process.stdout.write('.');
                // console.log('[>>>Ответ<<<]');
                // console.log(data);
            });
            this.querySys.fActionErr((err:any) => {
                this.iSendErr++;
                console.error(err);
            });
            this.querySys.fSend(MsgStrT.send, aMsg);

            console.log(aMsg);

            this.iSend++;
        }
        
	}


    /**
	 * Отправить сообщение в очередь
	 * @param sQueue
	 * @param msg
	 */
	public async waitSend() {
        let iCompleteBefore = 0;

        let iAnswer = 0;
        while(iAnswer < this.iSend){
            await mWait(1000);
            iAnswer = this.iSendComplete + this.iSendErr + iCompleteBefore;
            // if(this.iSend - (this.iSendComplete+this.iSendErr) < 100){
                iCompleteBefore++;
                
                console.log('[waitsend]:','exe:',iAnswer, 'tot:',this.iSend, 'comp|err|bef:',this.iSendComplete, this.iSendErr,iCompleteBefore)
            // }
        }

        await mWait(1000);
        
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