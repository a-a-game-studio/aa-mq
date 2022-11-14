
export enum MsgT {
    connect = '/connect', // Сообщение о соединении
    check = '/check', // Проверка соединения
    send = '/send', // Отправить сообщение
    ask = '/ask', // Получить сообщение
    count = '/count', // Количество сообщений
    info = '/info' // Информация по очереди 
}

export interface MsgContext {
	queue: string; // Очередь
    ip:string; // Входной IP адрес
    data?:any; // Данные
}
