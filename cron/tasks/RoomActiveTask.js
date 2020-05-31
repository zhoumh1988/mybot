const Task = require('./Task')
const {connect} = require('./DB')
const Utils = require('../plugins/Utils');
const {
    info: log,
    err
} = require('../plugins/Log');
class RoomActiveTask extends Task {
    constructor() {
        super();
        /** 定时任务表达式 */
        //this.cron = Utils.moment().add(8, 'minute').format('0 m h * * *');
        this.cron = '0 30 1 * * *';
    }

    /**
     * 定时任务执行入口
     */
    run() {
        let date = Task.PROPS.yesterday.format('YYYY-MM-DD');
        let sql = `
            SELECT count(DISTINCT wechat_id) AS total,roomid 
            FROM chats  
            WHERE  created > ?  and  created < ?  group  by  roomid `;
        let type = ["1", "7", "30"];
        type.forEach(v => {
            connect(sql, Task.PROPS.activeTypes[v], rs => {
                if (rs !== false) {
                    rs.forEach(item => {
                        let info = item.total;
                        let roomid = item.roomid;
                        let insert_sql = `INSERT INTO stat_room_active (roomid,type,info,date) VALUE (?,?,?,?)  ON DUPLICATE KEY UPDATE info = ? `;
                        let insert_params = [roomid, v, info, date, info];
                        connect(insert_sql, insert_params, insert_rs => {
                            if (insert_rs !== false) {
                                log.info(`[房间日活统计成功][${date}][${v}][${roomid}]${info}`);
                            } else {
                                err.error('RoomActive insert is err' + v);
                            }
                        })
                    })
                } else {
                    err.error('RoomActive select is err' + v);
                }
            });
        });
    }
}

module.exports = RoomActiveTask;