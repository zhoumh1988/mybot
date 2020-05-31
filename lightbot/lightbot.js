/**
 * @author LittleStrong
 * @summary 
 */
const {
    DEFAULT_ROOMS: default_rooms
} = require('./config')
const {
    Wechaty,
    Room,
    Contact,
    Friendship,
    Message,
} = require('wechaty')
const {
    info,
    err
} = require('./plugin/Log')
const Query = require('./service/Query')
const User = require('./model/User')
const {
    moment,
    isNotEmpty,
    getMesssageType,
} = require('./plugin/Utils')
const MQReciver = require('./plugin/MQReciver')
// xml转json
const parser = require('xml2json');
// 消息队列
const reciver = new MQReciver();
// 记录心跳次数
let HEARTBEAT_TIMES = 0;

/**
 * 保存房间信息
 * 
 * @description 若群组存在更新群组信息，否则新增群组信息
 * @function saveRoom(room: Room, sync: Boolean)
 * @param {Room} room 群组
 * @param {Boolean} sync 是否同步群成员信息 defalut: false
 */
const saveRoom = async function (room, sync) {
    let record = {};
    record.id = room.id;
    record.topic = await room.topic();
    record.announce = await room.announce();
    let members = await room.memberList();
    record.member_num = members.length;
    Query.saveRoom(record);
    if (sync === true) {
        members.forEach(async c => {
            if (c && !c.self()) {
                saveUser(c, room.id);
            }
        });
    }
}

/**
 * 
 * 保存用户
 * @description 如果用户存在，更新用户信息，否则新增用户信息。
 * @function saveUser(contact:Contact, roomid: String)
 * @param {Contact} contact 微信用户
 * @param {String} roomid 群组id
 * @return void
 */
const saveUser = async function (contact, roomid) {
    Query.isExisted(contact.id, roomid, async res => {
        if (res === false) {
            return;
        }
        try {
            if (roomid) {
                let user = new User(contact);
                user.setRoomid(roomid);
                user.setGender(contact.gender());
                if (isNotEmpty(res) && parseInt(res.id || 0) !== 0) {
                    info.info(`更新用户${res.id}！`);
                    user.setId(res.id);
                    // 更新用户信息
                    Query.syncContact(user, res => {
                        if (res === false) {
                            err.error(`同步用户${contact.name()}信息失败`)
                        } else {
                            info.info(`同步用户${contact.name()}信息`);
                        }
                    });
                } else {
                    info.info(`新增用户${contact.id}！`);
                    // 新增用户信息
                    let avatar = await contact.avatar();
                    avatar = await avatar.toDataURL();
                    Query.insertImage(avatar, imgId => {
                        user.setAvatar(imgId);
                        Query.addUser(user, res => {
                            info.info(`新增用户${contact.name()}信息`);
                        });
                    })
                }
            }
        } catch (e) {
            err.error(`保存用户${contact.name()}信息失败，【${e.message}】，error=${e}`);
        }
    });
}

/**
 * 处理好友申请
 * @function friendship(fship: Friendship)
 * @param {Friendship} fship 
 */
const friendship = async fship => {
    const contact = fship.contact()
    try {
        switch (fship.type()) {
            // 1. New Friend Request
            case Friendship.Type.Receive:
                await fship.accept()
                let msg = `你好，光链小助手欢迎你！
回复“加入光链群”即可加入光链微信群，回复“联系小助手”稍后小助手将回复您。
光链是全球首个“安全性，高性能，去中心化”三要素完备的公链。
请关注光链其它社群及推广渠道：
telegram电报群: t.me/lightchain_cn
官方公众号：光链LightChain
官方新浪微博：LightChain光链
一直播ID：346346982
交易平台：
OKEx: www.okex.com
IDAX：www.idax.mn
KKcoin: www.kkcoin.com`;
                contact.say(msg);
                info.info(`Request from ${contact.name()} is accept succesfully!`);
                break
                // 2. Friend Ship Confirmed
            case Friendship.Type.Confirm:
                info.info(`friend ship confirmed`);
                break
        }
    } catch (e) {
        err.error(`Request from ${contact.name()} failed to accept!`)
    }
}

/**
 * 保存发言信息
 * 
 * @function saveMessage(message: Message)
 * @param {Message} message
 */
const saveMessage = async message => {

    const content = message.text()
    const sender = message.from()
    const room = message.room()

    let messageType = getMesssageType(message.type());
    if(messageType === 0) {
        return;
    }
    
    // 记录聊天信息
    if (messageType === 6) {
        // 存储图片
        let filebox = await message.toFileBox();
        let msgContent = await filebox.toDataURL();
        Query.addChat(msgContent, sender.id, room.id, messageType);
    } else if (messageType === 7) {
        // 存储文本
        Query.addChat(content, sender.id, room.id, messageType, async chatId => {
            // 判断回复内容是否违规
            !message.self() && Query.isFoul(content, chatId, async kid => {
                if (kid != 0) {
                    // 记录并查询用户违规次数
                    Query.recordFoul(sender.id, room.id, chatId, kid, async times => {
                        if (times > 2) {
                            await room.say(`您已违规3次！`, sender);
                            await room.del(sender);
                        } else {
                            await room.say(`您的回复内容已违规，再违规${ 3 - times}次将被踢出群组。`, sender);
                        }
                    });
                } else {
                    // 查看是否踩中了关键词
                    Query.queryKeyword(content, chatId, 1, moment().format('HH:mm:ss'), async reply => {
                        await room.say(reply, sender);
                    });
                }
            });
        });
    } else {
        // 非图片和文案的xml解析
        let contentJson = parser.toJson(content);
        contentJson = JSON.stringify(contentJson);
        info.warn(`[${messageType}] - ${contentJson}`);
        Query.addChat(contentJson, sender.id, room.id, messageType);
    }
}

const bot = new Wechaty({
    profile: "lightbot",
    puppet: 'padchat'
})

bot.on('scan', (qrcode, status) => {
        require('qrcode-terminal').generate(qrcode, {
            small: true
        });
    })
    // 扫码登录
    .on('login', async user => {
        let msg = `${user} login at ${moment().format('YYYY-MM-DD hh:mm:ss')}`;
        console.log(msg)
        info.info(msg);
        info.info("待更新房间topic：",default_rooms)
        // 更新光链1~10群信息
        default_rooms.forEach(async topic => {
            let r = await bot.Room.find({
                topic: topic
            });
            if (r) {
                saveRoom(r, true);
            } else {
                info.warn(`房间 {${topic}} 未检索到。`)
            }
        });

        reciver.init(bot);
    }).on('logout', (user) => {
        let msg = `${user} logout at ${moment().format('YYYY-MM-DD hh:mm:ss')}`;
        console.log(msg)
        info.info(msg);
        reciver.stop();
    })
    // 消息自动回复
    .on('message', async function (message) {

        const room = message.room()
        const content = message.text()
        const sender = message.from()

        let topic = room ? await room.topic(): null;
        if (room && default_rooms.indexOf(topic) !== -1) {
            try {
                // 判断是否是新用户，若是保存到数据库
                saveUser(sender, room.id);
            } catch (e) {
                err.error(`saveUser error When get message. Error is : ${e}`);
            }

            try {
                saveMessage(message);
            } catch (e) {
                err.error(`When save message. Error is ${e}`);
            }
        }

        if (message.self()) {
            return
        }

        if (!room && content == '加入光链群') {
            Query.queryRoomRandom(async res => {
                let roomid = process.env.NODE_ENV === 'pro' ? res.roomid : '11464033773@chatroom';
                info.warn(`邀请用户${sender.name()}进入群${roomid}`);
                const room = bot.Room.load(roomid);
                if (room) {
                    let topic = await room.topic();
                    try {
                        await room.add(sender);
                        await room.say(`欢迎加入 ${topic} `, sender);
                    } catch (e) {
                        err.error(`Can't join room. ${e}`);
                        console.error(e)
                    }
                }
            });
            return
        }
    })
    .on('friendship', friendship)
    .on('room-topic', async room => {
        let topic = await room.topic();
        if (default_rooms.indexOf(topic) != -1) {
            saveRoom(room);
        }
    })
    .on('room-join', async (room, inviteeList, inviter) => {
        let topic = await room.topic();
        if (default_rooms.indexOf(topic) != -1) {
            inviteeList.forEach(c => {
                saveUser(c, room.id);
            });
            try {
                saveRoom(room);
            } catch (e) {
                err.error(e);
            }
        }
    })
    .on('room-leave', async room => {
        let topic = await room.topic();
        if (default_rooms.indexOf(topic) != -1) {
            saveRoom(room);
        }
    })
    .on('heartbeat', async res => {
        info.info(`heartbeat ${++ HEARTBEAT_TIMES} times`);
    })
    .on('error', e => err.error('Bot', 'error: %s', e));

bot.start();

process.on('SIGINT', () => {
    console.log('按下Control-D退出进程。');
    reciver.stop();
});