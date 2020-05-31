const Task = require('./Task')
const Reptile = require('../plugins/Reptile')
class ReptileTask extends Task {
    constructor() {
        super();
        /** 每5分钟执行1次任务 */
        this.cron = '0 */5 * * * *';
    }

    /**
     * 定时任务执行入口
     */
    run() {
        Reptile.start();
    }
}

module.exports = ReptileTask;