
import { db } from "./System/DBConnect";

import dayjs from 'dayjs';
import { mFormatDateTime } from "./Helper/DateTimeH";

async function run(){

    // Удаляем логи старше 1 недели
    const dtClear7Day = mFormatDateTime(dayjs().subtract(7, 'day'));


    const dtClear1Month = mFormatDateTime(dayjs().subtract(1, 'month'));
    

    const msgAsk = await db('msg').where('ask_time', '<', dtClear7Day).del();
    console.log('Удалено записей обработанных спустя 7 дней:', msgAsk);

    const msgNoAsk = await db('msg').where('updated_at', '<', dtClear1Month).whereNull('ask_time').del();
    console.log('Удалено записей не обработанных спустя 1 месяц:', msgNoAsk);

    console.log('=========================');
    console.log('END');
    console.log('=========================');
    process.exit(0)
}
run().catch((error) => {
    console.log('>>>ERROR>>>',error);
    process.exit(1)
});