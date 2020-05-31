const redis = require('redis');
const {CHANNELS, REDIS_CONFIG} = require('../config');
const {err} = require('./Log');
const client = redis.createClient(REDIS_CONFIG.PORT, REDIS_CONFIG.HOST);

//连接错误处理
client.on("error", function (error) {
    err.error(`redis连接异常${error}`);
});

process.on('SIGINT', () => {
    console.log('关闭redis连接');
    client.quit();
});

/**
 *
 * 推送消息
 * @param {String} msgObj JSON串
 * @param {Integer} type 0-定时消息 1-即时消息 2-配置修改
 */
const push = (msgObj, type) => {
    if (typeof msgObj !== 'string') {
        msgObj = JSON.stringify(msgObj);
    }
    client.publish(CHANNELS[type], msgObj);
}

/**
 * 定时推送
 * @param {JSON} msgObj
 * 
 {
     msg: true, 消息，必填
 }
 */
const timePush = (msgObj) => {
    if (typeof msgObj !== 'string') {
        msgObj = JSON.stringify(msgObj);
    }
    push(msgObj, 0);
}

/**
 * 即时推送
 * @param {JSON} msgObj
 * 
 {
     roomid: '', 群组，必填
     msg: true, 消息，必填
     wechat_id: '' 需要@的用户，非必填
 }
 */
const immediatePush = (msgObj) => {
    if (typeof msgObj !== 'string') {
        msgObj = JSON.stringify(msgObj);
    }
    push(msgObj, 1);
}

/**
 * 配置修改
 * @param {JSON} msgObj
 * 
 {
     roomid: '', 群组，必填
     is_report_day: true, 日报，非必填
     is_report_week: true 周报，非必填
 }
 */
const settingsPush = (msgObj) => {
    if (typeof msgObj !== 'string') {
        msgObj = JSON.stringify(msgObj);
    }
    push(msgObj, 2);
}

module.exports = {
    client,
    push,
    timePush,
    immediatePush,
    settingsPush
}