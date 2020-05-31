const Utils = require('./plugins/Utils');
const start = Utils.moment('2018-07-24');
const diff = Utils.moment().diff(start, 'day');
const Tasks = require('./tasks');
const Task = require('./tasks/Task');
const {
    info,
    err
} = require('./plugins/Log')
const {
    pool
} = require('./tasks/DB')


const testInit = (date) => {
    let yesterday = Utils.moment(date).subtract(1, 'day');
    let week = Utils.moment(date).subtract(1, 'week');
    let month = Utils.moment(date).subtract(30, 'day');

    Task.PROPS = {
        yesterday: yesterday,
        week: week,
        month: month,
        wordTypes: {
            "1": [6, '%' + yesterday.format('YYYY-MM-DD') + '%', 0, 5, 1],
            "5": [6, '%' + yesterday.format('YYYY-MM-DD') + '%', 5, 10, 1],
            "10": [6, '%' + yesterday.format('YYYY-MM-DD') + '%', 10, 20, 1],
            "20": [6, '%' + yesterday.format('YYYY-MM-DD') + '%', 20, 9999999, 1],
        },
        activeTypes: {
            "1": [yesterday.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
            "7": [week.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
            "30": [month.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
        }
    }
}

info.warn("start = " + start.format('YYYY-MM-DD'))

console.log(`Start init`);
info.warn('Start init');
let i = 0;
const reset = () => {
    if (i > diff) {
        console.log('End init');
        info.warn('End init');
        return;
    }
    info.warn(start.format('YYYY-MM-DD'))
    testInit(start);
    Object.keys(Tasks).forEach(ClassName => {
        if (ClassName == 'Task') {
            return;
        }
        const T = Tasks[ClassName];
        let t = new T();
        try {
            info.warn(`Execute ${ClassName}'s run.`)
            t.run.call(t);
        } catch (e) {
            err.error(`${ClassName} run is error.The error is ${e}`);
        }
    });
    start.add(1, 'day');
    i++
    setTimeout(reset, 1000);
}

reset();


process.on('SIGINT', () => {
    console.info('cron SIGINT signal received.')

    pool.end(function (err) {
        // all connections in the pool have ended
        if (err) {
            error.error(err);
        }
        console.log('已关闭所有数据库连接')
    });
});

// for (let i = 0; i <= diff; i++ , start.add(1, 'day')) {
//     info.warn(start.format('YYYY-MM-DD'))
//     testInit(start);
//     Object.keys(Tasks).forEach(ClassName => {
//         if(ClassName == 'Task'){
//             return;
//         }
//         const T = Tasks[ClassName];
//         let t = new T();
//         try {
//             info.warn(`Execute ${ClassName}'s run.`)
//             t.run.call(t);
//         } catch (e) {
//             err.error(`${ClassName} run is error.The error is ${e}`);
//         }
//     });
// }