
import ip from 'ip'
import { db } from './DBConnect';
import { v4 as uuidv4 } from 'uuid';
import { mFormatDateTime } from '../Helper/DateTimeH';
import _, { NumericDictionaryIterateeCustom } from 'lodash';
import { MsgContext } from '../interface/CommonI';



/** информация по сообщению в БД*/
export interface DBQueueInfoI{
    queue:string;
    ip:string;
    count_no_work:number;
    count_send:number;
    count_ask:number;
    count_work:number;
    speed_send:number;
    speed_ask:number;
    speed_work:number;
}

/** информация по сообщению в БД*/
export interface DBMsgInfoI{
    id?:number;
    uid:string;
    queue:string;
    server_ip:string;
    data:string;
    send_time:string;
    send_ip:string;
    ask_time:string;
    ask_ip:string;
    work_time:string;
    work_ip:string;
}

/** информация по сообщению */
export interface MsgInfoI{
    uid:string; // Уникальны идентификатор
    send_time?:number,
    send_ip?:string,
    ask_time?:number,
    ask_ip?:string,
    work_time?:number,
    work_ip?:string
}

/** информация по сообщению */
export interface QueueInfoI{
    count:number, // Количество необработанных сообщений в очереди
    ip:string, // IP 
    ask_speed:number, // скорость в секунду
    work_speed:number, // скорость в секунду
    send_speed:number, // скорость в секунду
}

/** Компонент Очередь */
export class MqQueueC {
    ixMsg:Record<number, any> = {};
    ixInfo:Record<number, MsgInfoI> = {};
    ixAskComplete:Record<number, string> = {}; // Пеметить в БД как запрошенные
    ixWorkComplete:Record<number, string> = {}; // Пеметить в БД как отработанные

    ip:''; // IP адрес очереди
    iQueDel = 0; // Курсон удаленных сообщений
    iQueSpeed = 0; // Курсор сообщений для расчета статистики за последнюю минуту
    iQueStartDb = 0; // Курсор сообщений перенесенных в БД
    iQueStart = 0; // Курсор необработанных сообщений
    iQueEnd = 0; // Курсор конца сообщений

    /** Получить значение из очереди */
    public get(msg:MsgContext){
        let iQueStart = 0;
        if(this.iQueEnd > this.iQueStart){
            iQueStart = ++this.iQueStart;
        } else {
            return null;
        }

        console.log(iQueStart,this.ixMsg[iQueStart])

        const data = this.ixMsg[iQueStart];
        
 
        const vMsgInfo = this.ixInfo[iQueStart]
        
        vMsgInfo.ask_time = Date.now();
        vMsgInfo.ask_ip = msg.ip;

        this.ixAskComplete[iQueStart] = vMsgInfo.uid;
        
        return data;
    
    }

    /** Поместить значение в очередь */
    public set(msg:MsgContext){
        const iQueEnd = ++this.iQueEnd;
    
        this.ixMsg[iQueEnd] = msg.data;

        this.ixInfo[iQueEnd] = {
            uid:uuidv4(),
            send_time: Date.now(),
            send_ip: msg.ip
        }
    }

    /** Поместить значение в очередь */
    public count(){
        return this.iQueEnd - this.iQueStart;
    }

    /** Получить информацию по очереди */
    public info(): QueueInfoI{

        const vQueueInfo:QueueInfoI = <any>{};
        vQueueInfo.count = this.iQueEnd - this.iQueStart;
        vQueueInfo.ip = ip.address();
        vQueueInfo.ask_speed = 0; // Скорость в секунду
        vQueueInfo.work_speed = 0; // скорость в секунду
        vQueueInfo.send_speed = 0; // скорость в секунду

        return vQueueInfo;
    }
}

/** Система очередей */
export class MqServerSys {
    public ixQueue:Record<string, MqQueueC> = {};

    /** Получить из очереди */
    public get(msg:MsgContext){
        
        if(!this.ixQueue[msg.queue]){
            this.ixQueue[msg.queue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[msg.queue];
        
        return vMqQueueC.get(msg);
        
    }
    
    /** Поместить значение в очередь */
    public set(msg:MsgContext){
        if(!this.ixQueue[msg.queue]){
            this.ixQueue[msg.queue] = new MqQueueC();
        }

        process.stdout.write('.')

        const vMqQueueC = this.ixQueue[msg.queue];

        vMqQueueC.set(msg)
    }

    /** Получить количество сообщений в очереди */
    public count(sQue:string){
        if(!this.ixQueue[sQue]){
            this.ixQueue[sQue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[sQue];

        return vMqQueueC.count();
    }

    /** Получить информацию по очереди */
    public info(sQue:string): QueueInfoI{

        if(!this.ixQueue[sQue]){
            this.ixQueue[sQue] = new MqQueueC();
        }

        const vMqQueueC = this.ixQueue[sQue];

        return vMqQueueC.info();
    }

    /** Получить информацию по очереди */
    public async dbInit(){

        const bExistMsg = await db.schema.hasTable('msg');
        if(!bExistMsg){
            await db.schema.createTable('msg', table => {

                table.bigIncrements('id')
                    .comment('ID');

                table.string('uid', 36)
                    .unique('uid')
                    .comment('Уникальный идентификатор');

                table.string('queue', 100)
                    .index('queue')
                    .comment('IP отправки');

                table.string('server_ip', 20)
                    .comment('IP отправки');

                table.text('data')
                    .comment('Данные');

                table.dateTime('send_time')
                    .nullable()
                    .comment('время отправки');
        
                table.string('send_ip', 20)
                    .comment('IP отправки');

                table.dateTime('ask_time')
                    .nullable()
                    .comment('время отправки');
        
                table.string('ask_ip', 20)
                    .comment('IP отправки');
                
                table.dateTime('work_time')
                    .nullable()
                    .comment('время отправки');
        
                table.string('work_ip', 20)
                    .comment('IP отправки');

                table.dateTime('created_at', null)
                    .index('created_at')
                    .notNullable()
                    .defaultTo(db.raw('CURRENT_TIMESTAMP'))
                    .comment('Время создания записи');

                table.dateTime('updated_at')
                    .index('updated_at')
                    .notNullable()
                    .defaultTo(db.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
                    .comment('Время обновления записи');
                    
            });
        }

        const bExistQueue = await db.schema.hasTable('queue');
        if(!bExistQueue){
            await db.schema.createTable('queue', table => {
                table.increments('id')
                    .comment('ID');

                table.string('queue', 100)
                    .comment('Наименование очереди');
        
                table.string('ip', 20)
                    .comment('ip очереди');

                table.bigInteger('count_no_work')
                    .defaultTo(0)
                    .comment('Количество необработанных сообщений в очереди');

                table.bigInteger('count_send')
                    .defaultTo(0)
                    .comment('Количество отправленных сообщений');

                table.bigInteger('count_ask')
                    .defaultTo(0)
                    .comment('Количество запрошенных сообщений');

                table.bigInteger('count_work')
                    .defaultTo(0)
                    .comment('Количество обработанных сообщений');

                table.integer('speed_send')
                    .defaultTo(0)
                    .comment('скорость отправки сообщений в секунду');

                table.integer('speed_ask')
                    .defaultTo(0)
                    .comment('скорость запроса сообщений в секунду');

                table.integer('speed_work')
                    .defaultTo(0)
                    .comment('скорость обработки сообщений в секунду');

                table.dateTime('created_at', null)
                    .index('created_at')
                    .notNullable()
                    .defaultTo(db.raw('CURRENT_TIMESTAMP'))
                    .comment('Время создания записи');

                table.dateTime('updated_at')
                    .index('updated_at')
                    .notNullable()
                    .defaultTo(db.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
                    .comment('Время обновления записи');

                table.unique(['queue', 'ip'])
            });
        }
    }


    /** Сохранить информацию по очереди */
    public async dbSave(){

        
        const akQueue = Object.keys(this.ixQueue);
        for (let i = 0; i < akQueue.length; i++) {
            const kQueue = akQueue[i];
            const vMqQueueC = this.ixQueue[kQueue]

            const aMqLog:any[] = [];
            const iQueStartDb = vMqQueueC.iQueStartDb;
            const iQueEnd = vMqQueueC.iQueEnd;

            let aiMsgSave:number[] = [];


            // Сохраняем новые
            for (let c = iQueStartDb + 1, j = 0; c <= iQueEnd && j < 1000; c++, j++) {
                aiMsgSave.push(c);
                vMqQueueC.iQueStartDb++;
            }

            
            // Сохраняем которые запросили
            const aiAllAskComplete = Object.keys(vMqQueueC.ixAskComplete)
            const ixMsgID:Record<number, number> = {}
            if(aiAllAskComplete.length){
                // const ixAskComplete = vMqQueueC.ixAskComplete;
                // vMqQueueC.ixAskComplete = {};

                const aiComplete = aiAllAskComplete.slice(0,1000);

                // console.log('aiComplete:',aiComplete);
                const auidComplete:string[] = [];
                for (let j = 0; j < aiComplete.length; j++) {
                    const iComplete = Number(aiComplete[j]);

                    auidComplete.push(vMqQueueC.ixAskComplete[iComplete]);
                }

                // console.log('auidComplete:',auidComplete);

                // const auidComplete = Object.values(ixAskComplete);

                const aMsgDb = await db('msg').whereIn('uid', auidComplete).select('id', 'uid');

                const ixMsgDb = _.keyBy(aMsgDb, 'uid');

                
                for (let j = 0; j < aiComplete.length; j++) {
                    const iComplete = Number(aiComplete[j]);
                    const uidComplete = vMqQueueC.ixAskComplete[iComplete];

                    aiMsgSave.push(iComplete);
                    delete vMqQueueC.ixAskComplete[iComplete];

                    const vMsgDb = ixMsgDb[uidComplete];

                    if(vMsgDb){
                        ixMsgID[iComplete] = vMsgDb.id;
                    }
                }
            }

            // console.log('aiMsgSave:',aiMsgSave);
            aiMsgSave = _.uniq(aiMsgSave);
            // console.log('aiMsgSave:',aiMsgSave);

            for (let j = 0; j < aiMsgSave.length; j++) {
                const iMsg = aiMsgSave[j];

                const vMsgDb:DBMsgInfoI = <any>{};
                const vMsg = vMqQueueC.ixMsg[iMsg];
                const vMsgInfo = vMqQueueC.ixInfo[iMsg];

                if(vMsg && vMsgInfo){
                
                    if(ixMsgID[iMsg]){
                        vMsgDb.id = Number(ixMsgID[iMsg]);
                    }


                    vMsgDb.uid = vMsgInfo.uid;
                    vMsgDb.queue = kQueue;
                    vMsgDb.server_ip = ip.address();
                    vMsgDb.data = JSON.stringify(vMsg);
                    vMsgDb.send_time = vMsgInfo.send_time ? mFormatDateTime(vMsgInfo.send_time) : null;
                    vMsgDb.send_ip = vMsgInfo.send_ip
                    vMsgDb.ask_time = vMsgInfo.ask_time ? mFormatDateTime(vMsgInfo.ask_time): null;
                    vMsgDb.ask_ip = vMsgInfo.ask_ip
                    vMsgDb.work_time = vMsgInfo.work_time ? mFormatDateTime(vMsgInfo.work_time): null;
                    vMsgDb.work_ip = vMsgInfo.work_ip
                    aMqLog.push(vMsgDb);
                    
                } else {
                    console.log('ERROR>>>',aiMsgSave.length, vMsg, vMsgInfo);
                }

            }

            if(aMqLog.length){
                try {
                    let sql = (db('msg')
                        .insert(aMqLog)
                    ).toString();
                    sql = sql.replace(/^insert/i, 'replace');

                    // console.log('sql>>>',sql);
                    await db.raw(sql);
            
                } catch (e) {
                    console.log('>>>ERROR>>>', e);
                }

                console.log('Сохранение данных: [', kQueue, ']', aMqLog.length);
            } else {
                process.stdout.write('.');
            }

            
        }
        
    }
}