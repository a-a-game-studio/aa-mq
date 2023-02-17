
import { db } from "../System/DBConnect";
import { v4 as uuid4 } from 'uuid';
import { mRandomInteger } from "../Helper/NumberH";



import { mWait } from "../Helper/WaitH";
import { MqClientSys } from "../System/MqClientSys";
import * as conf from '../Config/MainConfig'

// CORE API
const mqClientSys = new MqClientSys({
    baseURL: 'ws://127.0.0.1:'+conf.common.port,
    nameApp: 'test_client'
})

async function run(){

    for (let i = 0; i < 100; i++) {
        const sMsg = '['+i+'] СообщениЕ ['+i+']';

        mqClientSys.send('test', {text:sMsg});

        if(i % 1000 == 0){
            process.stdout.write('.');
        }
        
    }
    
    await mqClientSys.waitSend();

    await mWait(1000);


    const cnt1 = await mqClientSys.count('test');

    console.log('cnt:',cnt1);

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

