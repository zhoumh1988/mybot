const Tasks = require('./tasks');
const Task = Tasks.Task;
const {
    info: log
} = require('./plugins/Log');
const moment = require('moment');

// 开始日期
let startDate = moment('2018-11-18');
// 结束日期
let endDate = moment('2018-10-20');

/**
 * 初始化数据时间
 * @param {Moment} date 
 */
const initProps = (date) => {
    log.info('start initProps' + date.format('YYYY-MM-DD'));
    let yesterday = moment(date).subtract(1, 'day');
    let week = moment(date).subtract(1, 'week');
    let month = moment(date).subtract(30, 'day');

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
    // log.info(`initProps TASK.PROPS is ${JSON.stringify(Task.PROPS)}`);
}

/**
 * 执行任务
 */
const runTasks = () => {
    const jobs = [];
    let times = 0;
    Object.keys(Tasks).forEach(ClassName => {
        if (ClassName !== 'Task' && ClassName !== 'ReptileTask') {
            let t = new Tasks[ClassName]();
            jobs.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    t.run();
                    resolve();
                }, times * 1000);
            }));
        }
    });
    return Promise.all(jobs);
}

/**
 * 递归处理时间
 * @param {Moment} date 
 */
const recursion = (date) => {
    return new Promise((resolve, reject) => {
        initProps(moment(date));
        runTasks().then(() => {
            date.add(1, 'days');
            resolve();
        });
    }).then(() => {
        if (endDate.diff(date, 'days') >= 0) {
            recursion(date);
        } else {
            console.log('结束');
        }
    });
}
recursion(startDate);