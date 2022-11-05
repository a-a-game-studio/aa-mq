
import net from 'net';
import { MsgT } from './Config/MainConfig';

var SERVER_PORT = 8080;
var ADDR = "127.0.0.1";

let cntConnect = 0;

let iQueEnd = 0;
let iQueStart = 0;
const aQueue:string[] = [];

// =============================================================
// var remoteSocket = new net.Socket();
let bConnect = false;



var serverWorker = net.createServer(function (clientSocket:net.Socket) {
    console.log('==============================');
    console.log('CONNECT CLIENT ',cntConnect)
    console.log('==============================');
    // var remoteSocket = new net.Socket();

    let iConnect = 0;

    


    console.log(clientSocket.eventNames());
    clientSocket.on('data', function (msg) {

        iConnect++;

        console.log('==============================');
        console.log('>>>>HEAD<<<<', iConnect);
        
        if(Number(msg[0]) == MsgT.send){
            console.log('>>>>',Number(msg[0]), '- Отправка сообщения');
        }

        if(Number(msg[0]) == MsgT.ask){
            console.log('>>>>',Number(msg[0]), '- Запрос сообщения');
        }
        
        console.log('>>>>BODY<<<<');
        console.log('>>>>[', msg.toString(), ']');
        console.log('==============================');

        const iBodyLen = Number(msg[0]|msg[1]|msg[2])

        const abMsg = Buffer.alloc(iBodyLen);
        // msg.copy(abMsg, 0, 5)
        // const sMsg = abMsg.toString();

     
            // console.log('===========>>>', Buffer.from(ab, 'hex').toString('hex'))
            // Buffer.from('test1', 'hex')
            //
            aQueue.push(abMsg.toString());
            clientSocket.write('принял:['+msg+']');
            // clientSocket.end();
        
        

        
    });

    clientSocket.write('test0');

    

    // clientSocket.on("End", (data:any) => {
    //     console.log('<< End client to proxy', data.toString());

    //     if(iConnect){
    //         remoteSocket.end();
    //     }
    // });

    // ====================================


        // remoteSocket.connect(SERVER_PORT, ADDR, () => {
        //     console.log('>> From proxy to remote CONNECT');
        // });

    //     bConnect = true;
    
    
    // remoteSocket.on("data", (data:Buffer) => {
    //     console.log('')
    //     console.log('==================================')
    //     console.log('----------------------------------')
    //     console.log('data_outb>>>',Number(data[4]));
    //     console.log('----------------------------------')
    //     console.log('data_outb>>>',data.toString('ascii'));
    //     console.log('----------------------------------')
    //     console.log('data_outb>>>',data.toString('hex'));
    //     console.log('----------------------------------')
    //     console.log('data_outb>>>',data.slice(44,data.length));
    // });


    // remoteSocket.on("End", (data:any) => {
    //     console.log('<< End remote to proxy', data.toString());
    //     clientSocket.end();
    // });


    // console.log('----',sSrvProtocol.toString());
    // clientSocket.write(Buffer.from([]))


    

    // fSync(socket, serviceSocket, '');

    // console.log(clientSocket.bytesRead)

    // socket.end('goodbye\n');
});

        
        

serverWorker.listen(SERVER_PORT);
console.log("TCP server accepting connection on port: " + SERVER_PORT);


