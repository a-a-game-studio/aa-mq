
import { db } from "../System/DBConnect";
import { v4 as uuid4 } from 'uuid';
import { mRandomInteger } from "../Helper/NumberH";



import { mWait } from "../Helper/WaitH";
import { QuerySys } from "@a-a-game-studio/aa-front";
import { MqClientSys } from "../System/MqClientSys";

// CORE API
export const coreApi = {
    baseURL: 'ws://127.0.0.1:8080',
    timeout: 30000,
    withCredentials: true,
};

var SERVER_PORT = 8080;
var ADDR = "127.0.0.1";
let iConnect = 0;


async function run(){

    const mqClientSys = new MqClientSys(<any>coreApi)

    // const querySys = new QuerySys()
    // querySys.fConfigWs(coreApi);


    /** Инициализация страницы */
    

    


    for (let i = 0; i < 10000; i++) {
        const sMsg = '['+i+'] СообщениЕ ['+i+']';

        mqClientSys.send('test', {text:sMsg});

        if(i % 1000 == 0){
            process.stdout.write('.');
        }

        // if(i%1000 == 0){
        //     await mWait(1000);
        // }
        

    
        // const ab = Buffer.from([
        //     MsgT.send,
        //     'statement'.length,
        //     ...Buffer.from('statement'),
        //     ...Buffer.alloc(4, sMsg.length),
        //     ...Buffer.from(sMsg)
        // ])

        // console.log('тип', MsgT.send);
        // console.log('длинна', 'statement'.length);
        // console.log('сообщение', ...Buffer.from('statement'));
        // console.log('==============================');

        // console.log(i,ab);

        // querySys.fInit();
        // querySys.fActionOk((data: any) => {
        //     process.stdout.write('.');
        //     // console.log('[>>>Ответ<<<]');
        //     // console.log(data);
        // });
        // querySys.fActionErr((err:any) => {
        //     console.error(err);
        // });
        // querySys.fSend('/send', {msg:sMsg});

        
        
    }
    
    await mqClientSys.waitSend();

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
// for (let i = 0; i < 20; i++) {
run().catch((error) => {
    console.log('>>>ERROR>>>',error);
    process.exit(1)
});

// }

