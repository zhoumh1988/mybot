const Task = require('./Task')
const {connect} = require('./DB')
const Utils = require('../plugins/Utils');
const {
    info: log,
    err
} = require('../plugins/Log');
class AdminActiveTask extends Task {
    constructor() {
        super();
        /** 定时任务表达式 */
        //this.cron = Utils.moment().add(6, 'minute').format('0 m h * * *');
        this.cron = '0 10 1 * * *';
    }

    /**
     * 定时任务执行入口
     */
    run() {
        let date = Task.PROPS.yesterday.format('YYYY-MM-DD');
        let sql = `
            SELECT count(DISTINCT c.wechat_id) AS total 
            FROM chats ch 
            LEFT JOIN contact c ON c.wechat_id = ch.wechat_id AND c.roomid = ch.roomid 
            WHERE  ch.created > ? and ch.created < ? and  c.role != ? `;

        let type = ["1", "7", "30"];
        type.forEach(v => {
            connect(sql, Task.PROPS.activeTypes[v], rs => {
                if (rs !== false) {
                    let info = rs[0].total;
                    let insert_sql = `INSERT INTO stat_admin_active (type,info,date) VALUE (?,?,?)  ON DUPLICATE KEY UPDATE info = ? `;
                    let insert_params = [v, info, date, info];
                    connect(insert_sql, insert_params, insert_rs => {
                        if (insert_rs !== false) {
                            log.info(`[管理员日活统计成功][${date}][${v}]${info}`);
                        } else {
                            err.error('AdminActive insert is err' + v);
                        }
                    })
                } else {
                    err.error('AdminActive select is err' + v);
                }
            });
        });
    }
}

module.exports = AdminActiveTask;