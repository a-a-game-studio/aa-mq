
import { AAContext, AARoute, AAServer } from '@a-a-game-studio/aa-server';


import { MqServerSys } from './System/MqServerSys';
import { faSendRouter as faSend } from './System/ResponseSys';

import { MsgContextI, MsgT } from './interface/CommonI';
import { common } from './Config/MainConfig';

let cntConnect = 0;

const gMqServerSys = new MqServerSys();

gMqServerSys.dbInit();

/** Интервал записи данных в бд */
const intervalDb = setInterval(() => {
    gMqServerSys.dbSave()
},1000)


// =============================================================
// var remoteSocket = new net.Socket();
let bConnect = false;

const app = new AAServer();
// if (config.common.env === 'dev' || config.common.env === 'test') {
    app.use((ctx: AAContext) => {
        console.log(`>:${ctx.req.url}`);
        ctx.next();
    });
// }


   
const router = new AARoute();

// app.use(ParseBodyMiddleware);


/**
 * Приход сообщений
 */
 router.ws(MsgT.send, async (ctx: AAContext) => {

    // console.log('send>>', ctx.body)
    // console.log('IP',ctx.body.ip);

    // if(giQueEnd % 1000 == 0){
    //     console.log('send>>',giQueEnd - giQueStart)
    // }
    // console.log('Это вопрос от клиента')

    const auidMsg:string[] = [];
    if(ctx.body.length){
        for (let i = 0; i < ctx.body.length; i++) {
            const msg = ctx.body[i];

            auidMsg.push(msg.uid);

            if(!gMqServerSys.ixMsgSend[msg.uid]){
                gMqServerSys.ixMsgSend[msg.uid] = Date.now();
                gMqServerSys.set(msg); 
            }
               
        }
    } else {
        auidMsg.push(ctx.body.uid);

        if(!gMqServerSys.ixMsgSend[ctx.body.uid]){
            gMqServerSys.ixMsgSend[ctx.body.uid] = Date.now();
            gMqServerSys.set(ctx.body);
        }
    }
    

    return faSend(ctx, auidMsg);
    
});


/**
 * Уход сообщений
 */
 router.ws(MsgT.ask, async (ctx: AAContext) => {

    // console.log(ctx.body)
    // console.log('Это вопрос от клиента')

    const data = gMqServerSys.get(ctx.body);
    console.log('ask>>>',ctx.body, data)

    // if(data){

        return faSend(ctx, data);
    // } else {
    //     return faSendRouter(ctx, {msg:'нет сообщений'});
    // }

});

/**
 * Количество сообщений
 */
 router.ws(MsgT.count, async (ctx: AAContext) => {

    const data = gMqServerSys.count(ctx.body.queue);
    console.log('count>>>',ctx.body, data)

    // if(data){
        return faSend(ctx, data);
    // } else {
    //     return faSendRouter(ctx, {msg:'нет сообщений'});
    // }

});




app.route(router)

// Обработчик ошибок
app.error((AAContext) => {
    console.log('[]>>>ERROR<<<]');
    console.log(AAContext.err.getTraceList());
});

console.log(`

 █████╗ ██████╗ ██╗
██╔══██╗██╔══██╗██║
███████║██████╔╝██║
██╔══██║██╔═══╝ ██║
██║  ██║██║     ██║
╚═╝  ╚═╝╚═╝     ╚═╝

`);

app.listenWs(common.port, common.host, () => {
    console.log(`server start at ${common.host}:${common.port}`);

    return true;
});
