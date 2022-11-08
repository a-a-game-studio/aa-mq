import { QuerySys } from "@a-a-game-studio/aa-front";


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
        this.querySys.fSend('/send', {
            queue:sQueue,
            msg:msg
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
        this.querySys.fSend('/ask', {queue:sQueue});
    }

}