
export enum MsgT {
    connect = '/connect', // Сообщение о соединении
    check = '/check', // Проверка соединения
    send = '/send', // Отправить сообщение
    ask = '/ask', // Получить сообщение
    work = '/work', // Получить сообщение
    count = '/count', // Количество сообщений
    info = '/info' // Информация по очереди 
}

export interface MsgContext {
    n?:string; // Номер сообщения (когда оно уже зарегистрированно)
	queue: string; // Очередь
    app:string; // Наименование приложения
    ip:string; // Входной IP адрес
    data?:any; // Данные
}
