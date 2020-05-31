const mysql = require('mysql');
const config = require('../config');
const pool = mysql.createPool(config.mysql);
const format = mysql.format;
const {
    query: log,
    err: errLog
} = require('../plugins/Log');

/**
 * 连接池拿连接查询
 * @param {String} sql 执行的sql语句
 * @param {Function} cb 回调函数
 */
const connect = (sql, params, cb) => {
    sql = format(sql, params);
    log.info(sql);
    pool.getConnection(async (conn_err, connection) => {
        if (conn_err) {
            errLog.error(`${sql}\n${conn_err}`);
        } else {
            connection.query(sql, async function (error, res, fields) {
                try {
                    if (error) {
                        errLog.error(`${sql}\n${error}`);
                        typeof cb == 'function' && cb(false);
                    } else {
                        typeof cb == 'function' && cb(res ? res : {}, ...arguments);
                    }
                } catch (e) {
                    errLog.error(e.message);
                } finally {
                    connection.release();
                }
            });
        }
    });
};

module.exports = {
    connect,
    pool
}