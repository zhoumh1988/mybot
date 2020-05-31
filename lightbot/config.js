const path = require('path')
const mysql = {
    connectionLimit : 20,
    host: 'localhost',
    user: 'lightbot',
    password: '2AGgvT6T!kZqefcL',
    database: 'lightbot',
    charset: 'utf8mb4'
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

const DEFAULT_ROOMS = [];
if(process.env.NODE_ENV === 'pro') {
    for (let i = 1; i <= 10; i++) {
        DEFAULT_ROOMS.push(`Light光链～${i}群`);
    }
    DEFAULT_ROOMS.push('Light光链测试群');
} else {
    DEFAULT_ROOMS.push('Light光链测试群');
    DEFAULT_ROOMS.push('Light光链测试群2');
}

/** 日志根目录 */
const LOGS_PATH = process.env.NODE_ENV !== 'pro' ? path.resolve(__dirname + '/logs/') : "/tmp/logs/lightbot";


console.log(`WECHATY_PUPPET_PADCHAT_TOKEN = ${process.env.WECHATY_PUPPET_PADCHAT_TOKEN}`);
console.log(`log level = ${process.env.WECHATY_LOG}`);

module.exports = {
    mysql,
    CHANNELS,
    REDIS_CONFIG,
    DEFAULT_ROOMS,
    LOGS_PATH,
}