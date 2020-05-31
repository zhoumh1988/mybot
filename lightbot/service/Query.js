const {_pool_connection, format} = require('./DB')
const Utils = require('../plugin/Utils');

/**
 * 判断用户是否存在
 * @param {String} id 
 * @param {String} roomid 
 * @param {Function} cb 
 */
const isExisted = (id, roomid, cb) => {
    _pool_connection(`SELECT id, name, avatar FROM contact WHERE wechat_id = '${id}' AND roomid='${roomid}'`, cb);
}

/**
 * 插入用户
 * @param {User} user 
 * @param {Function} cb 
 */
const addUser = (user, cb) => {
    let sql = `INSERT INTO contact`;
    let attrs = `wechat_id, roomid, avatar, name, gender`;
    let values = `?, ?, ?, ?, ?`;
    let params = [user.wechat_id, user.roomid, user.avatar, user.name, user.gender];
    if(user.province && user.province.length !== 0) {
        attrs += ' , province, city';
        values += ' , ?, ?';
        params.push(user.province);
        params.push(user.city);
    }
    sql += ` (${attrs}) values (${values})`;
    sql = format(sql, params);
    _pool_connection(sql, cb);
}

/**
 * 同步用户信息
 * @param {JSONObject} user 
 * @param {Function} cb 
 */
const syncContact = (user, cb) => {
    let sql = `UPDATE contact SET name = ?, gender = ?`;
    let params = [user.name, user.gender];
    if(user.province && user.province.length !== 0) {
        sql += ` , province = ?, city = ?`;
        params.push(user.province);
        params.push(user.city);
    }
    params.push(user.id);
    sql += ` WHERE id = ?`;
    sql = format(sql, params);
    _pool_connection(sql, cb);
}

/**
 * 同步用户头像
 * @param {JSONObject} user 
 * @param {Function} cb 
 */
const syncContactAvatar = (user, cb) => {
    let params = [user.avatar, user.id];
    let sql = format(`UPDATE contact SET avatar = ? WHERE id = ?`, params);
    _pool_connection(sql, cb);
}

/**
 * 插入聊天记录
 * @param {String} content 发言内容 若是图片存储图片id
 * @param {String} wechat_id 发言人id
 * @param {String} roomid 群id
 * @param {Integer} type 发言类型 6-图片 7-文本
 * @param {Function} cb 回调函数
 */
const addChat = (content, wechat_id, roomid, type, cb) => {
    if(type == 6) {
        insertImage(content, imageId => {
            let sql = `INSERT INTO chats (wechat_id, roomid, content, type) VALUES (?,?,?,?)`;
            let params = [wechat_id, roomid, imageId, type];
            sql = format(sql, params);
            _pool_connection(sql);
        });
    } else if (type == 7) {
        let sql = `INSERT INTO chats (wechat_id, roomid, content, type) VALUES (?,?,?,?)`;
        let params = [wechat_id, roomid, content, type];
        sql = format(sql, params);
        _pool_connection(sql, (res, error, rows, fields) => {
            cb(rows ? rows.insertId : null);
        });
    } else {
        let sql = `INSERT INTO chats (wechat_id, roomid, content, type) VALUES (?,?,?,?)`;
        let params = [wechat_id, roomid, content, type];
        sql = format(sql, params);
        _pool_connection(sql, (res, error, rows, fields) => {
            // cb(rows ? rows.insertId : null);
        });
    }
}

/**
 * 根据roomid查询是否有数据
 * @param {String} roomid 
 * @param {Function} cb 
 */
const countRoomByRoomid = (roomid, cb) => {
    _pool_connection(`SELECT count(1) AS 'count' FROM room WHERE roomid = '${roomid}'`, cb);
}

/**
 * 新增room
 * @param {*} room 
 */
const insertRoom = (room) => {
    let sql = `INSERT INTO room (roomid, topic, announce, member_num) values (?, ?, ?, ?)`;
    let params = [room.id, room.topic, room.announce, room.member_num];
    sql = format(sql, params);
    _pool_connection(sql);
}

/**
 * 更新room信息
 * @param {JSON} room 
 */
const updateRoomByRoomid = (room) => {
    let sql = `UPDATE room SET topic = ?, announce = ?, member_num = ? WHERE roomid = ?`;
    let params = [room.topic, room.announce, room.member_num, room.id];
    sql = format(sql, params);
    _pool_connection(sql)
}

/**
 * 保存room信息
 * @param {JSON}}} room 
 */
const saveRoom = (room) => {
    countRoomByRoomid(room.id, res => {
        if(parseInt(res.count) != 0) {
            updateRoomByRoomid(room);
        } else {
            insertRoom(room);
        }
    });
}

/**
 * 随机获取一个roomid
 * @param {Function} cb 
 */
const queryRoomRandom = cb => {
    _pool_connection('SELECT roomid FROM room WHERE id != 11 AND member_num < 400 LIMIT 1', cb);
}

/**
 * 插入图片到数据库表
 * @param {String}} img 图片的base64编码
 * @param {Function}} cb 回调函数
 */
const insertImage = (img, cb) => {
    _pool_connection(`INSERT INTO images (img_base64) values ('${img}')`, (res, error, rows, fields) => {
        cb(rows ? rows.insertId : null);
    });
}

/**
 * @description 记录关键词曝光次数
 * @param {Integer} kid 
 * @param {Integer} cid 
 */
const exposureKeyword = (kid, cid) => {
    let $sql = `INSERT INTO keywords_chat_ref (keyword_id, chat_id) VALUES (${kid}, ${cid})`;
    _pool_connection($sql);
}

/**
 * @name queryKeyword
 * @description 通过关键词查询关键词回复记录
 * @param {String} keyword 待匹配关键词
 * @param {String} chatId 聊天记录id
 * @param {Integer} fitType 匹配方式 1-完全匹配 2-模糊匹配
 * @param {String} curTime 当前时间
 * @param {Function} cb 回调函数
 */
const queryKeyword = (keyword, chatId, fitType, curTime, cb) => {
    let $sql = `
    SELECT 
        id, reply 
    FROM 
        keywords 
    WHERE 
        status = 1 
    AND type = 1 
    AND ${fitType === 1 ? `keyword = ?` : `LOCATE(keyword, ?) > 0`} 
    AND fit_type = ? 
    AND ((valid_start < ? AND ? < valid_end) OR (valid_start IS NULL AND valid_end IS NULL)) 
    ORDER BY RAND() LIMIT 1`;
    $sql = format($sql, [keyword, fitType, curTime, curTime]);
    _pool_connection($sql, rs => {
        if(Utils.isNotEmpty(rs)) {
            exposureKeyword(rs.id, chatId);
            cb(rs.reply);
        } else if(fitType === 1) {
            queryKeyword(keyword, chatId, 2, curTime, cb);
        }
    });
}

/**
 * @name queryFoulKeyword
 * @description 通过关键词查询违规关键词
 * @param {String} keyword 
 * @param {Integer} chatId
 * @param {Function} cb 
 */
const isFoul = (keyword, chatId, cb) => {
    let $sql = 'SELECT id FROM keywords WHERE status = 1 AND type = 2 AND keyword LIKE CONCAT("%", ? ,"%")';
    $sql = format($sql, [keyword]);
    _pool_connection($sql, rs => {
        if(Utils.isNotEmpty(rs)) {
            exposureKeyword(rs.id, chatId);
        }
        cb(parseInt(rs.id || 0));
    });
}

/**
 * 
 * @param {Integer} cid 发言人id
 * @param {Integer} rid 群组id
 * @param {Integer} chid 发言id
 * @param {Integer} kid 关键词id
 * @param {Function} cb 回调函数
 */
const recordFoul = (cid, rid, chid, kid, cb) => {
    let $sql = `INSERT INTO fouls (wechat_id, roomid, chat_id, keyword_id) VALUES (?,?,${chid}, ${kid})`;
    $sql = format($sql, [cid, rid]);
    _pool_connection($sql, () => {
        $sql = `SELECT COUNT(1) AS times FROM fouls WHERE wechat_id = ? AND roomid = ? AND deleted IS NULL`;
        $sql = format($sql, [cid, rid]);
        _pool_connection($sql, rs => {
            cb(parseInt(rs.times));
        });
    });
}

/**
 * 查询群组消息通知开关
 * @param {Function} cb 
 */
const queryRoomSettings = (cb) => {
    let $sql = ` SELECT roomid, is_report_day, is_report_week FROM room`;
    _pool_connection($sql, (res, error, rows, fields) => {
        cb(rows);
    });
}

module.exports = {
    isExisted,
    addUser,
    syncContact,
    syncContactAvatar,

    addChat,

    saveRoom,
    countRoomByRoomid,

    queryRoomRandom,
    insertImage,

    queryKeyword,
    isFoul,
    recordFoul,

    queryRoomSettings,
}
