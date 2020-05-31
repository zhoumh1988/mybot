const mysql = require('mysql');
const config = require('../config');
const pool = mysql.createPool(config.mysql);
const format = mysql.format;
const { query: log, err: errLog } = require('../plugins/Log');

/**
 * 连接池拿连接查询
 * @param {String} sql 执行的sql语句
 * @param {Function} cb 回调函数
 */
const _pool_connection = (sql, cb) => {
    log.info(sql);
    pool.getConnection(async(conn_err, connection) => {
        if (conn_err) {
            errLog.error(`${sql}\n${conn_err}`);
        } else {
            connection.query(sql, async function(error, res, fields) {
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

/**
 * 连接池拿连接查询format 防止sql注入和处理特殊符号
 * @param {String} sql 执行的sql语句
 * @param {Array} params 查询参数
 * @param {Function} cb 回调函数
 */
const _pool_connection_format = (sql, params, cb) => {
    sql = format(sql, params);
    _pool_connection(sql, cb);
};
process.on('SIGINT', () => {
    console.log('Received SIGINT. Press Control-D to exit.');

    pool.end(function (err) {
        // all connections in the pool have ended
        if (err) {
            error.error(err);
        }
        console.log('已关闭所有数据库连接')
    });
});

module.exports = {
    _pool_connection_format,
    _pool_connection,
    format,
    pool
};