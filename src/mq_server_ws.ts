
import { AAContext, AARoute, AAServer } from '@a-a-game-studio/aa-server';
import { MsgStrT, MsgT } from './Config/MainConfig';
import ParseBodyMiddleware from './Middleware/ParseBodyMiddleware';
import { MqServerSys } from './System/MqServerSys';
import { faSendRouter } from './System/ResponseSys';

var SERVER_PORT = 8080;
var SERVER_HOST = "127.0.0.1";

let cntConnect = 0;

const gMqServerSys = new MqServerSys();


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
 * узнать баланс счёта орга
 */
 router.ws(MsgStrT.ask, async (ctx: AAContext) => {
    // console.log(ctx.body)
    // console.log('Это вопрос от клиента')

    const data = gMqServerSys.get(ctx.body.queue);
    console.log('ask>>>', data)

    // if(data){
        return faSendRouter(ctx, data);
    // } else {
    //     return faSendRouter(ctx, {msg:'нет сообщений'});
    // }

    
});


/**
 * узнать баланс счёта орга
 */
router.ws(MsgStrT.send, async (ctx: AAContext) => {
    console.log('send>>', ctx.body)
    // if(giQueEnd % 1000 == 0){
    //     console.log('send>>',giQueEnd - giQueStart)
    // }
    // console.log('Это вопрос от клиента')
    
    gMqServerSys.set(ctx.body.queue, ctx.body.msg);
    // console.log('que>>',ixQueue);

    // ctx.ws.send(JSON.stringify({
    //     ok: true,
    //     e: false,
    //     data: data
    // }));

    return faSendRouter(ctx, null);
    
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
