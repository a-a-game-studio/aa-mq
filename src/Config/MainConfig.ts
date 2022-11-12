// ==============================================================
// Подключения баз данных
// ==============================================================

export enum MsgT {
    connect = 0, // Сообщение о соединении
    check = 1, // Проверка соединения
    send = 2, // Отправить сообщение
    ask = 3, // Получить сообщение
    count = 4, // Количество сообщений
    info = 5 // Информация по очереди 
}

export enum MsgStrT {
    connect = '/connect', // Сообщение о соединении
    check = '/check', // Проверка соединения
    send = '/send', // Отправить сообщение
    ask = '/ask', // Получить сообщение
    count = '/count', // Количество сообщений
    info = '/info' // Информация по очереди 
}

// Сообщение в байт 256
// 1 - тип
// 1 - длинна имени очереди
// n - имя очереди
// 4 - длинна сообщения
// n - сообщение

export const dbConf = { // Knex mysql
    client: "mysql2",
    connection: {
        host: "localhost",
        user: "root",
        port:3306,
        password: "Angel13q24w35e",
        database: "aa_mq"
    },
    pool: { "min": 0, "max": 7 },
    acquireConnectionTimeout: 5000
};

// CORE API
export const coreApi = {
    baseURL: 'ws://127.0.0.1:8080',
    timeout: 30000,
    withCredentials: true,
  };