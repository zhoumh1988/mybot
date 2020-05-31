const {query : log, err} = require('../plugin/Log');
const config = require('../config');
const mysql = require('mysql');
const pool = mysql.createPool(config.mysql);

const format = mysql.format;

/**
 * 连接池拿连接查询
 * @param {String} sql 执行的sql语句
 * @param {Function} cb 回调函数
 */
const _pool_connection = (sql, cb) => {
    log.info(sql);
    pool.getConnection(async (conn_err, connection) => {
        if(conn_err) {
            err.error(`${sql}\n${conn_err}`);
        } else {
            connection.query(sql, async function (error, res, fields) {
                try{
                    if(error) {
                        err.error(`${sql}\n${error}`);
                        typeof cb == 'function' && cb(false);
                    } else if(typeof cb == 'function'){
                        cb(res && res[0] ? res[0] : {}, ...arguments);
                    }
                }catch(e) {
                    err.error(e.message);
                }finally {
                    connection.release();
                }
            });
        }
    });
}


module.exports = {
    _pool_connection,
    format
}

process.on('SIGINT', () => {
    pool.end(function (err) {
        // all connections in the pool have ended
        if (err) {
            error.error(err);
        }
        console.log('已关闭所有数据库连接')
    });
})