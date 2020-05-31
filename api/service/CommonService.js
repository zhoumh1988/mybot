const {_pool_connection_format} = require('./DB');
const {TIMEOUT} = require('../plugins/Log');
const {isEmpty} = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const BASE_PATH = '/api/common';
const MQPusher = require('../plugins/MQPusher');
const {REPTILE_LIGHTCHAIN} = require('../config');

const CommonService = function (app) {

    const replyMsg = (record) => {
        return new Promise((resolve, reject) => {

            let $sql = ` INSERT INTO reply ({attrs}) VALUES ({values})`;
    
            let values = [];
            let attrs = [];
            let params = [];
            for (let prop in record) {
                if (record[prop]) {
                    attrs.push(prop);
                    values.push('?');
                    params.push(record[prop]);
                }
            }
            $sql = $sql
                .replace('{attrs}', attrs.join(','))
                .replace('{values}', values.join(','));
            _pool_connection_format($sql, params, res => {
                if (res !== false) {
                    if (res.insertId) {
                        MQPusher.immediatePush({...record});
                        resolve(res.insertId);
                    } else {
                        reject(400)
                    }
                } else {
                    reject(500)
                }
            })
        });
    }

    /**
     * 即时回复 群
     */
    app.post(`${BASE_PATH}/reply`, (request, response) => {
        let {roomid, msg, type} = request.body;
        if (isEmpty(roomid) || roomid === 0 || isEmpty(msg)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        if(roomid.indexOf(",") !== -1 || (Array.isArray(roomid) && roomid.length !== 0)) {
            if(roomid.indexOf(",") !== -1) {
                roomid = roomid.split(',');
            }
            let promises = roomid.map(rid => replyMsg({
                roomid: rid,
                msg,
                type
            }));
            Promise.all(promises).then(res => {
                const dto = new DTO();
                dto.set({ids: res});
                response.json(dto.toJSON());
            }).catch(e => {
                TIMEOUT(response, `发送即时消息失败`);
            });
        } else {
            replyMsg({
                roomid,
                msg,
                type
            }).then(res => {
                const dto = new DTO();
                dto.set({ids: res});
                response.json(dto.toJSON());
            }).catch(e => {
                TIMEOUT(response, `发送即时消息失败`);
            });
        }
    })

    /**
     * 即时回复 聊天记录
     */
    app.post(`${BASE_PATH}/reply/chat`, (request, response) => {
        const {msg, chat_id, type} = request.body;
        if (isEmpty(chat_id) || chat_id === 0 || isEmpty(msg)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        let $sql = ` SELECT wechat_id, roomid FROM chats WHERE id = ?`;
        _pool_connection_format($sql, [chat_id], res => {
            if(res !== false) {
                const {roomid, wechat_id} = res[0];
                replyMsg({
                    chat_id,
                    roomid,
                    wechat_id,
                    msg,
                    type
                }).then(res => {
                    const dto = new DTO();
                    dto.set({ids: res});
                    response.json(dto.toJSON());
                }).catch(e => {
                    TIMEOUT(response, `发送即时消息失败`);
                });
            } else {
                TIMEOUT(response, `【失败】即时回复聊天记录`);
            }
        });


    })

    /**
     * 查看图片
     */
    app.get(`${BASE_PATH}/img/:id`, (request, response) => {
        let {id} = request.params;
        id = Number(id);
        if (!Number.isInteger(id)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = ` SELECT img_base64 FROM images WHERE id = ?`;
        _pool_connection_format($sql, [id], res => {
            if (res === false) {
                TIMEOUT(response, `获取图片${id}失败，返回结果：${JSON.stringify(res)}`);
            } else {
                if (res.length !== 0) {
                    let match = new RegExp('data:(.*);base64');
                    let contentType = res[0]
                        .img_base64
                        .match(match)[1];
                    let img_base64 = res[0]
                        .img_base64
                        .replace(match, '');
                    response.writeHead(200, {"Content-Type": contentType});
                    let img = Buffer
                        .from(img_base64, 'base64')
                        .toString('binary');
                    response.end(img, 'binary');
                } else {
                    response.writeHead(400);
                    response.end();
                }
            }
        });
    });

    app.get(`${BASE_PATH}/index`, (request, response) => {
        MQPusher
            .client
            .get(REPTILE_LIGHTCHAIN, (err, value) => {
                const dto = new DTO();
                if (err) {
                    TIMEOUT(response, `获取首页展示数据失败：${JSON.stringify(err)}`);
                    return;
                }
                const result = JSON.parse(value);
                dto.setData(result);
                response.json(dto.toJSON());
            });
    });

    
}

module.exports = CommonService;