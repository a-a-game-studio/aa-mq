import { QuerySys } from "@a-a-game-studio/aa-front";
import { resolve } from "dns";
import e from "express";

import ip from 'ip'
import { reject } from "lodash";
import { mWait } from "../Helper/WaitH";
import { MsgT } from "../interface/CommonI";


export class MqClientSys {

    conf:{
        baseURL: string, // 'ws://127.0.0.1:8080',
        nameApp: string, // Наименование приложения
    } = null;

    private querySys:QuerySys = null;
    iSend:number = 0;
    iSendComplete:number = 0;
    iSendErr:number = 0;

    // Работа с буфером
    iLastTimeSend = Date.now();
    ixSendBuffer:Record<string, any[]> = {};
    iSendBufferCount = 0;

    // Установка количество рабочик в воркере
    // iWorkerMax = 0;
    // iWorker = 0;
    ixWorker:Record<string, {
        max?:number;
        count?:number;
        interval?:any;
    }> = {}



    constructor(conf:{
        baseURL: string, // 'ws://127.0.0.1:8080',
        nameApp: string, // Наименование приложения
    }){
        this.querySys = new QuerySys()
        this.querySys.fConfigWs(conf);
        this.conf = conf;
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
        this.querySys.fSend(MsgT.send, {
            app:this.conf.nameApp,
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
                app:this.conf.nameApp,
                ip:ip.address(),
                queue:sQueue,
                data:msg
            });
            this.iSendBufferCount++;

            if(this.iSendBufferCount < 1000){
                return null;
            }
        }

        this.endBuffer()
        
	}

    /**
	 * Отправить накопленный буфер
	 * @param sQueue
	 * @param msg
	 */
	public endBuffer(): void {

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
            this.querySys.fSend(MsgT.send, aMsg);

            console.log(aMsg);

            this.iSend++;
        }
    }

    /**
	 * Отслеживать очередь
	 * @param sQueue
	 * @param msg
	 */
	public async watchWork(sQueue:string, iWorkerMax:number, cb:Function): Promise<void> {
        
        // Бесконечное ожидание
        let bRun = true;
        let iWait = 0;
        if(!this.ixWorker[sQueue]){
            this.ixWorker[sQueue]
            this.ixWorker[sQueue] = {};

            const vWorker = this.ixWorker[sQueue];

            vWorker.count = 0;
            vWorker.max = iWorkerMax;
            vWorker.interval = setInterval(async () => {
             
                if(vWorker.count < vWorker.max && iWait <= 0){

                    try{
                        this.ask(sQueue, async(data:any) => {
                            if(data){
                                vWorker.count++;
                                await cb(data);
                                vWorker.count--;
                            } else {
                                iWait = 1000;
                            }
                            
                        });
                        
                    } catch(e){
                        console.log('ERROR>>>',e)
                        clearInterval(vWorker.interval);
                        bRun = false;
                    }
                }

                if(iWait >= 0){
                    iWait--;
                }
                
                
            }, 1);

            while(bRun){
                await mWait(1000*60);
            }
        }
        
    }


    /**
	 * Отправить сообщение в очередь
	 */
	public async waitSend() {
        let iCompleteBefore = 0;

        this.endBuffer(); // Отправить остатки буфера

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
    public ask(sQueue:string, cb:Function) {
        this.querySys.fInit();
        this.querySys.fActionOk(cb);
        this.querySys.fActionErr((err:any) => {
            reject(err)
        });
        this.querySys.fSend(MsgT.ask, {
            app:this.conf.nameApp,
            ip:ip.address(),
            queue:sQueue
        });
    }

    /** Запросить из очереди 
     * cb(data)
    */
    public work(sQueue:string, cb:Function): void {
        this.querySys.fInit();
        this.querySys.fActionOk(cb);
        this.querySys.fActionErr((err:any) => {
            console.error(err);
        });
        this.querySys.fSend(MsgT.work, {
            app:this.conf.nameApp,
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
        this.querySys.fSend(MsgT.count, {
            app:this.conf.nameApp,
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
        this.querySys.fSend(MsgT.info, {
            app:this.conf.nameApp,
            ip:ip.address(),
            queue:sQueue
        });
    }



}