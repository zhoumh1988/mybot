const Task = require('./Task')
const {connect} = require('./DB')
const Utils = require('../plugins/Utils');
const {
    info: log,
    err
} = require('../plugins/Log');
class UserWordTask extends Task {
    constructor() {
        super();
        /** 定时任务表达式 */
        //this.cron = Utils.moment().add(13, 'minute').format('0 m h * * *');
        this.cron = '0 20 2 * * *';
    }

    /**
     * 定时任务执行入口
     */
    run() {
        let date = Task.PROPS.yesterday.format('YYYY-MM-DD');
        let sql = `
            SELECT  count(1)  AS total,ch.roomid 
            FROM chats ch 
            LEFT JOIN contact c ON c.wechat_id = ch.wechat_id AND c.roomid = ch.roomid 
            WHERE ch.type= ? and  ch.created like ? and  char_length(ch.content) > ? and char_length(ch.content) <= ? and c.role = ?   group by ch.roomid`;
        let type = [1, 5, 10, 20];
        type.forEach(v => {
            connect(sql, Task.PROPS.wordTypes[v], rs => {
                if (rs !== false) {
                    rs.forEach(item => {
                        let info = item.total;
                        let roomid = item.roomid;
                        let insert_sql = `INSERT INTO stat_user_word (roomid,type,info,date) VALUE (?,?,?,?) ON DUPLICATE KEY UPDATE info = ? `;
                        let insert_params = [roomid, v, info, date, info];
                        connect(insert_sql, insert_params, insert_rs => {
                            if (insert_rs !== false) {
                                log.info(`[用户字数统计成功][${date}][${v}][${roomid}]${info}`);
                            } else {
                                err.error('UserWord insert is err' + v);
                            }
                        })
                    })
                } else {
                    err.error('UserWord select is err' + v);
                }
            });
        });
    }
}

module.exports = UserWordTask;