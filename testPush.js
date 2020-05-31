const pusher = require('./api/plugins/MQPusher');

/**
 * 日报
 */
pusher.timePush({
    msg: '日报',
    type: 'day'
});

/**
 * 周报
 */
pusher.timePush({
    msg: `周报`,
    type: 'week'
});

/**
 * 即时消息推送
 */
pusher.immediatePush({
    msg: '即时消息推送',
    roomid: '11464033773@chatroom',
});

/**
 * 即时消息推送并@阿布
 */
pusher.immediatePush({
    msg: '即时消息推送',
    roomid: '11464033773@chatroom',
    wechat_id: 'wxid_16vbt1hd1h0022'
});

/**
 * 推送开关推送
 */
pusher.settingsPush({
    roomid: '11464033773@chatroom',
    is_report_day: 1,
    is_report_week: 1
});
