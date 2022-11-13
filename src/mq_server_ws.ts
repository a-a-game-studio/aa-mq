
import { AAContext, AARoute, AAServer } from '@a-a-game-studio/aa-server';
import { MsgStrT, MsgT } from './Config/MainConfig';
import ParseBodyMiddleware from './Middleware/ParseBodyMiddleware';
import { MqServerSys } from './System/MqServerSys';
import { faSendRouter as faSend } from './System/ResponseSys';

import ip from 'ip'

var SERVER_PORT = 8080;
var SERVER_HOST = "127.0.0.1";

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
 router.ws(MsgStrT.send, async (ctx: AAContext) => {

    // console.log('send>>', ctx.body)
    // console.log('IP',ctx.body.ip);

    // if(giQueEnd % 1000 == 0){
    //     console.log('send>>',giQueEnd - giQueStart)
    // }
    // console.log('Это вопрос от клиента')
    if(ctx.body.length){
        for (let i = 0; i < ctx.body.length; i++) {
            const msg = ctx.body[i];
            gMqServerSys.set(msg);    
        }
    } else {
        gMqServerSys.set(ctx.body);
    }
    
    // console.log('que>>',ixQueue);

    // ctx.ws.send(JSON.stringify({
    //     ok: true,
    //     e: false,
    //     data: data
    // }));

    return faSend(ctx, null);
    
});


/**
 * Уход сообщений
 */
 router.ws(MsgStrT.ask, async (ctx: AAContext) => {

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
 router.ws(MsgStrT.count, async (ctx: AAContext) => {

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

app.listenWs(8080, '127.0.0.1', () => {
    console.log(`server start at ${SERVER_HOST}:${SERVER_PORT}`);

    return true;
});
