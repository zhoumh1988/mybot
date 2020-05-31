const CronJob = require('cron').CronJob;;
const Tasks = require('./tasks');
const {
    info: log,
    err
} = require('./plugins/Log');
const {
    pool
} = require('./tasks/DB');

/**
 * 任务集合
 */
const jobs = [];
/**
 * start 开始定时任务
 */
Object.keys(Tasks).forEach(ClassName => {
    const T = Tasks[ClassName];
    let t = new T();
    try {
        let job = new CronJob(t.cron, function () {
            try {
                log.info(`Execute ${ClassName}'s run.`)
                t.run.call(t);
            } catch (e) {
                err.error(`${ClassName} run is error.The error is ${e}`);
            }
        });
        jobs.push(job);
        job.start();
    } catch (e) {
        err.error(`cron is wrong. ${t.cron} ${e}`);
    }
});

process.on('SIGINT', () => {
    console.info('cron SIGINT signal received.')

    jobs.forEach(job => job.stop());

    pool.end(function (err) {
        // all connections in the pool have ended
        if (err) {
            error.error(err);
        }
        console.log('已关闭所有数据库连接')
    });
});