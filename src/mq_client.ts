
import { dbProxy } from "./System/DBConnect";
import { v4 as uuid4 } from 'uuid';
import { mRandomInteger } from "./Helper/NumberH";


import net from 'net';
import { mWait } from "./Helper/WaitH";
import { MsgT } from "./Config/MainConfig";

var SERVER_PORT = 8080;
var ADDR = "127.0.0.1";
let iConnect = 0;


async function run(){

    
    var clientMQ = new net.Socket();
    clientMQ.connect(SERVER_PORT);

    let sMsg = '';
    for (let i = 0; i < 10000; i++) {
        sMsg += '['+i+'] СообщениЕ ['+i+']';

    
        

        // console.log('тип', MsgT.send);
        // console.log('длинна', 'statement'.length);
        // console.log('сообщение', ...Buffer.from('statement'));
        // console.log('==============================');
        // console.log(i,ab);

        // clientMQ.write(ab);
        if(i% 1000 == 0){

            const ab = Buffer.from([
                MsgT.send,
                'statement'.length,
                ...Buffer.from('statement'),
                ...Buffer.alloc(4, sMsg.length),
                ...Buffer.from(sMsg)
            ])
            clientMQ.write(ab);
        }
        // clientMQ.end();
        
        
    }
    

    clientMQ.on('data', function (msg) {

        iConnect++;

        console.log('==============================');
        console.log('>>>>HEAD<<<<', iConnect);
        console.log('>>>>BODY<<<<');
        console.log('>>>>[', msg.toString(), ']');
        console.log('==============================');
    })
    
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