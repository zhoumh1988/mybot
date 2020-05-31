const redis = require('redis');
const {CHANNELS, REDIS_CONFIG} = require('../config');
const client = redis.createClient(REDIS_CONFIG.PORT, REDIS_CONFIG.HOST);

//连接错误处理
client.on("error", function (error) {
    console.log(error);
});

console.log('开始监听');
CHANNELS.forEach(channel => {
    client.subscribe(channel);
})

client.on('message', (channel, message) => {
    switch(CHANNELS.indexOf(channel)) {
        case 0: 
            console.log(`[${channel}] ${message}`)
            break;
        case 1:
            console.log(`[${channel}] ${message}`)
            break;
        case 2:
            console.log(`[${channel}] ${message}`)
            break;
        default:
            console.log('哪来都野孩子！');
    }
});