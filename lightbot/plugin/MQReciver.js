const redis = require('redis');
const {
    CHANNELS,
    REDIS_CONFIG
} = require('../config');
const {
    FileBox
} = require('file-box')
const Query = require('../service/Query');
const {
    info,
    err
} = require('./Log');
const {
    isNotEmpty
} = require('./Utils')

class MQReciver {
    constructor(bot) {
        this.settings = {};
        if(bot) {
            this.init(bot);
        }
    }

    _queryRoomSettings() {
        Query.queryRoomSettings(rs => {
            rs.forEach(room => {
                this.settings[room.roomid] = room;
            });
            info.warn(`初始化房间推送设置
${JSON.stringify(this.settings)}`);
        });
    }

    async _timepush(msg) {
        try {
            console.log(`[定时推送] ${msg}`);
            info.warn(`[定时推送] ${msg}`)
            let s = JSON.parse(msg);
            if (isNotEmpty(s) && isNotEmpty(s.msg) && isNotEmpty(s.type)) {
                for (let prop in this.settings) {
                    let set = this.settings[prop];
                    if (set && set[`is_report_${s.type}`] === 1) {
                        const room = this.bot.Room.load(prop);
                        if(s.type == 1) {
                            try{
                                const suffix = dataURL.split(",")[0].split(";")[0].split("/")[1];
                                const file = FileBox.fromDataURL(s.msg, `file.${suffix}`);
                                await room.say(file);
                            } catch(e) {
                                err.error(e);
                            }
                        } else {
                            await room.say(s.msg);
                        }
                    }
                }
            } else {
                throw `消息体为空`;
            }
        } catch (e) {
            err.error(`[定时推送] ${msg} - [ERROR] ${e}`);
        }
    }

    async _immediatepush(msg) {
        try {
            // console.log(`[即时推送] ${msg}`);
            info.warn(`[即时推送] ${msg}`)
            let s = JSON.parse(msg);
            if (isNotEmpty(s) && isNotEmpty(s.roomid)) {
                const room = this.bot.Room.load(s.roomid);
                const contact = isNotEmpty(s.wechat_id) ? this.bot.Contact.load(s.wechat_id) : null;
                if(s.type == 1) {
                    try{
                        let dataURL = s.msg;
                        const suffix = dataURL.split(",")[0].split(";")[0].split("/")[1];
                        const file = FileBox.fromDataURL(s.msg, `file.${suffix}`);
                        await room.say(file, contact);
                    } catch(e) {
                        err.error(e);
                    }
                } else {
                    await room.say(s.msg, contact);
                }
            } else {
                throw `消息体异常`;
            }
        } catch (e) {
            err.error(`[即时推送] ${msg} - [ERROR] ${e}`);
        }
    }

    async _settingspush(msg) {
        try {
            console.log(`[修改配置] ${msg}`);
            info.warn(`[修改配置] ${msg}`)
            let s = JSON.parse(msg);
            if (this.settings[s.roomid]) {
                for (let prop in s) {
                    if (typeof prop === 'string' && s[prop] !== null) {
                        this.settings[s.roomid][prop] = s[prop];
                    }
                }
            } else {
                this.settings[s.roomid] = s;
            }
            info.warn(`修改房间${s.roomid}推送设置
${JSON.stringify(this.settings)}`);
        } catch (e) {
            err.error(`[修改配置] ${msg} - [ERROR] ${e}`);
        }
    }

    init(bot) {
        this.bot = bot;
        const client = redis.createClient(REDIS_CONFIG.PORT, REDIS_CONFIG.HOST);
        //连接错误处理
        client.on("error", function (error) {
            err.error(error);
            console.log(error);
        });

        console.log(`开始监听${REDIS_CONFIG.HOST}:${REDIS_CONFIG.PORT}`);
        info.info('开始监听频道');
        CHANNELS.forEach(channel => {
            client.subscribe(channel);
        });

        client.on('message', (channel, message) => {
            // console.log(`[${channel}] ${message}`);
            info.info(`[接收消息] [频道：${channel}] ${message}`);
            switch (CHANNELS.indexOf(channel)) {
                case 0:
                    this._timepush(message);
                    break;
                case 1:
                    this._immediatepush(message);
                    break;
                case 2:
                    this._settingspush(message);
                    break;
                default:
                    console.log('哪来的野孩子！');
                    info.warn(`[哪来的野孩子！] [频道] ${channel} [消息体] ${message}`);
            }
        });
        this._queryRoomSettings();
        this.client = client;
    }
    stop() {
        this.client && this.client.quit();
        delete this.client;
    }
}

module.exports = MQReciver;