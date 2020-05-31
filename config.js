const path = require('path');
const mysqlENV = process.env.mysql
    ? JSON.parse(process.env.mysql)
    : {
        host: 'localhost',
        connectionLimit: '20'
    };
/** mysql数据库配置 */
const mysql = {
    connectionLimit: mysqlENV.connectionLimit,
    host: mysqlENV.host,
    port: 3306,
    user: 'lightbot_stat',
    password: '2AGgvT6T!kZqefcL',
    database: 'lightbot',
    charset: 'utf8mb4'
};

/** 日志根目录 */
const LOGS_PATH = process.env.NODE_ENV === 'dev' ? path.resolve(__dirname + '/logs/') : "/tmp/logs/lightbot";

/** 服务设置 */
const SERVER = {
    host: '127.0.0.1',
    port: 8081
}

/**
 * 推送频道
 * TIME_PUSH 定时推送
 * IMMEDIATE_PUSH 即时推送
 * SETTINGS_PUSH 设置推送
 */
const CHANNELS = ["TIME_PUSH", "IMMEDIATE_PUSH", "SETTINGS_PUSH"]

/**
 * Redis配置
 */
const REDIS_CONFIG = {
    "HOST": process.env.NODE_ENV === 'pro' ? 'localhost' : '192.168.10.202',
    "PORT": 6379
}

/**
 * 爬虫key
 */
const REPTILE_LIGHTCHAIN = "REPTILE_LIGHTCHAIN";

module.exports = {
    mysql,
    LOGS_PATH,
    SERVER,
    CHANNELS,
    REDIS_CONFIG,
    REPTILE_LIGHTCHAIN,
};