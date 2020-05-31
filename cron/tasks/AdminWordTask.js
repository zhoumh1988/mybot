const Task = require('./Task')
const {connect} = require('./DB')
const Utils = require('../plugins/Utils');
const {
    info: log,
    err
} = require('../plugins/Log');
class AdminWordTask extends Task {
    constructor() {
        super();
        /** 定时任务表达式 */
        // this.cron = Utils.moment().add(2, 'minute').format('0 m h * * *');
        this.cron = '0 20 1 * * *';
    }

    /**
     * 定时任务执行入口
     */
    run() {
        // let yesterday = Utils.moment().subtract(1, 'day');
        let date = Task.PROPS.yesterday.format('YYYY-MM-DD');
        let sql = `
            SELECT  count(1)  AS total 
            FROM chats ch 
            LEFT JOIN contact c ON c.wechat_id = ch.wechat_id AND c.roomid = ch.roomid 
            WHERE  ch.type=? and ch.created like ? and  char_length(ch.content) > ? and char_length(ch.content) <= ? and c.role != ? `;
        let type = [1, 5, 10, 20];
        type.forEach(v => {
            connect(sql, Task.PROPS.wordTypes[v], rs => {
                if (rs !== false) {
                    let info = rs[0].total;
                    let insert_sql = `INSERT INTO stat_admin_word (type,info,date) VALUE (?,?,?) ON DUPLICATE KEY UPDATE info = ? `;
                    let insert_params = [v, info, date, info];
                    connect(insert_sql, insert_params, insert_rs => {
                        if (insert_rs !== false) {
                            log.info(`[管理员字数统计成功][${date}][${v}]${info}`);
                        } else {
                            err.error('AdminWord insert is err' + v);
                        }
                    })
                } else {
                    err.error('AdminWord select is err' + v);
                }
            });
        });
    }
}

module.exports = AdminWordTask;