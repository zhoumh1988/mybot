/**
 * 表达式生成网址
 * http://cron.qqe2.com/
 * 表达式解析
    *    *    *    *    *    *    *
    ┬    ┬    ┬    ┬    ┬    ┬    ┬
    │    │    │    │    │    │    └ year 可以不设置
    │    │    │    │    │    └───── day of week (0 - 7) (0 or 7 is Sun)
    │    │    │    │    └────────── month (1 - 12)
    │    │    │    └─────────────── day of month (1 - 31)
    │    │    └──────────────────── hour (0 - 23)
    │    └───────────────────────── minute (0 - 59)
    └────────────────────────────── second (0 - 59, OPTIONAL)
 * 
 */
const Utils = require('../plugins/Utils');
const {
    info: log,
    err
} = require('../plugins/Log');
class Task {
    constructor() {
        // this.cron = Utils.moment().add(1, 'minute').format('0 m h * * *');
        this.cron = '0 0 1 * * *';
    }

    run() {
        initProps();
    }
}

const initProps = () => {
    log.info('start initProps');
    let yesterday = Utils.moment().subtract(1, 'day');
    let week = Utils.moment().subtract(1, 'week');
    let month = Utils.moment().subtract(30, 'day');

    Task.PROPS = {
        yesterday: yesterday,
        week: week,
        month: month,
        wordTypes: {
            "1": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 0, 5, 1],
            "5": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 5, 10, 1],
            "10": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 10, 20, 1],
            "20": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 20, 9999999, 1],
        },
        activeTypes: {
            "1": [yesterday.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
            "7": [week.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
            "30": [month.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
        }
    }
    log.info(`initProps TASK.PROPS is ${JSON.stringify(Task.PROPS)}`);
}
initProps();

const testInit = () => {
    let yesterday = Utils.moment().subtract(2, 'day');
    let week = Utils.moment().subtract(2, 'week');
    let month = Utils.moment().subtract(31, 'day');

    Task.PROPS = {
        yesterday: yesterday,
        week: week,
        month: month,
        wordTypes: {
            "1": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 0, 5, 1],
            "5": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 5, 10, 1],
            "10": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 10, 20, 1],
            "20": [7, '%' + yesterday.format('YYYY-MM-DD') + '%', 20, 9999999, 1],
        },
        activeTypes: {
            1: [yesterday.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
            7: [week.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
            30: [month.format('YYYY-MM-DD 00:00:00'), yesterday.format('YYYY-MM-DD 23:59:59'), 1],
        }
    }
}

//testInit();
//log.info(`testInit TASK.PROPS is ${JSON.stringify(Task.PROPS)}`);
module.exports = Task
