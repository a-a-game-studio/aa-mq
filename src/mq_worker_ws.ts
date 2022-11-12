
import { db } from "./System/DBConnect";
import { v4 as uuid4 } from 'uuid';
import { mRandomInteger } from "./Helper/NumberH";



import { mWait } from "./Helper/WaitH";
import { coreApi, MsgStrT, MsgT } from "./Config/MainConfig";
import { QuerySys } from "@a-a-game-studio/aa-front";
import { MqClientSys } from "./System/MqClientSys";

var SERVER_PORT = 8080;
var ADDR = "127.0.0.1";
let iConnect = 0;


async function run(){

    // const querySys = new QuerySys()
    // querySys.fConfigWs(coreApi);

    const mqClientSys = new MqClientSys(<any>coreApi)



    /** Инициализация страницы */
    

    


    for (let i = 0; i < 1000000; i++) {

        mqClientSys.ask('test', (data:any) => {
            if(data){
                console.log('[>>>Ответ<<<]');
                console.log(data);
            }
        })

        // console.log('тип', MsgT.send);
        // console.log('длинна', 'statement'.length);
        // console.log('сообщение', ...Buffer.from('statement'));
        // console.log('==============================');

        // console.log(i,ab);

        // querySys.fInit();
        // querySys.fActionOk((data: any) => {
        //     if(data){
        //         console.log('[>>>Ответ<<<]');
        //         console.log(data);
        //     }
        // });
        // querySys.fActionErr((err:any) => {
        //     console.error(err);
        // });
        // querySys.fSend('/ask', null);
        console.log('запрос', i)

        if(i % 100 == 0){
            await mWait(100);
        }
        // clientMQ.end();
        
        await mWait(1);
    }
    

    // clientMQ.on('data', function (msg) {

    //     iConnect++;

    //     console.log('==============================');
    //     console.log('>>>>HEAD<<<<', iConnect);
    //     console.log('>>>>BODY<<<<');
    //     console.log('>>>>[', msg.toString(), ']');
    //     console.log('==============================');
    // })
    
    await mWait(1000);

    // clientMQ.end();

    await mWait(1000);


    console.log('=========================');
    console.log('END');
    console.log('=========================');
    process.exit(0)
}

run().catch((error) => {
    console.log('>>>ERROR>>>',error);
    process.exit(1)
});