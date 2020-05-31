const Task = require('./Task')
const {connect} = require('./DB')
const Utils = require('../plugins/Utils');
const {
    info: log,
    err
} = require('../plugins/Log');
class UserActiveTask extends Task {
    constructor() {
        super();
        /** 定时任务表达式 */
        //this.cron = Utils.moment().add(12, 'minute').format('0 m h * * *');
        this.cron = '0 10 2 * * *';
    }

    /**
     * 定时任务执行入口
     */
    run() {
        let date = Task.PROPS.yesterday.format('YYYY-MM-DD');
        let sql = `
            SELECT count(DISTINCT c.wechat_id) AS total,c.roomid
            FROM chats ch 
            LEFT JOIN contact c ON c.wechat_id = ch.wechat_id AND c.roomid = ch.roomid 
            WHERE  ch.created > ? and ch.created < ? and  c.role = ?  group  by c.roomid `;

        let type = ["1", "7", "30"];
        type.forEach(v => {
            connect(sql, Task.PROPS.activeTypes[v], rs => {
                if (rs !== false) {
                    rs.forEach(item => {
                        let info = item.total;
                        let roomid = item.roomid;
                        let insert_sql = `INSERT INTO stat_user_active (roomid,type,info,date) VALUE (?,?,?,?)  ON DUPLICATE KEY UPDATE info = ? `;
                        let insert_params = [roomid, v, info, date, info];
                        connect(insert_sql, insert_params, insert_rs => {
                            if (insert_rs !== false) {
                                log.info(`[用户日活统计成功][${date}][${v}][${roomid}]${info}`);
                            } else {
                                err.error('UserActive insert is err' + v);
                            }
                        })
                    })
                } else {
                    err.error('UserActive select is err' + v);
                }
            });
        });
    }
}

module.exports = UserActiveTask;