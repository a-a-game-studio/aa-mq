
import { AAContext, AARoute, AAServer } from '@a-a-game-studio/aa-server';
import { MsgStrT, MsgT } from './Config/MainConfig';
import ParseBodyMiddleware from './Middleware/ParseBodyMiddleware';

var SERVER_PORT = 8080;
var SERVER_HOST = "127.0.0.1";

let cntConnect = 0;

let iQueEnd = 0;
let iQueStart = 0;
const aQueue:string[] = [];

// =============================================================
// var remoteSocket = new net.Socket();
let bConnect = false;

/**
 * Функция рендера страницы
 * @param faCallback - функция контролера
 */
 export const faSendRouter = async (ctx: AAContext, data:any): Promise<boolean> => {
	try {
		
        ctx.ws.send(JSON.stringify({
            ok: true,
            e: false,
            data: data
        }));
	} catch (e) {
        ctx.err.errorEx(e, ctx.req.url, 'Ошибка маршрута');
		ctx.error(500);
	}

    return false;
};




const app = new AAServer();
// if (config.common.env === 'dev' || config.common.env === 'test') {
    app.use((ctx: AAContext) => {
        console.log(`>:${ctx.req.url}`);
        ctx.next();
    });
// }

let giQueStart = 0;
let giQueEnd = 0;
const ixQueue:Record<string, Record<number, any>> = {};
   
const router = new AARoute();

// app.use(ParseBodyMiddleware);

function fQueGet(sQue:string){
    let iQueStart = 0;
    if(giQueEnd > giQueStart){
        iQueStart = giQueStart++;
    }

    
    
    if(!ixQueue[sQue]){
        ixQueue[sQue] = {};
    }
    

    const data = ixQueue[sQue][iQueStart];
    delete ixQueue[sQue][iQueStart];

    return data;

    
}

function fQuePush(sQue:string, data:any){
    const iQueEnd = giQueEnd++
    if(!ixQueue[sQue]){
        ixQueue[sQue] = {};
    }

    ixQueue[sQue][iQueEnd] = data;
}

/**
 * узнать баланс счёта орга
 */
 router.ws(MsgStrT.ask, async (ctx: AAContext) => {
    // console.log(ctx.body)
    // console.log('Это вопрос от клиента')

    const data = fQueGet('def');
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
    // console.log('send>>',giQueEnd - giQueStart, ctx.body)
    if(giQueEnd % 1000 == 0){
        console.log('send>>',giQueEnd - giQueStart)
    }
    // console.log('Это вопрос от клиента')
    
    fQuePush('def', ctx.body);
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
