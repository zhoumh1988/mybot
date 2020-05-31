const {_pool_connection_format} = require('./DB');
const {TIMEOUT} = require('../plugins/Log');
const {isEmpty, isNotEmpty} = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const BASE_PATH = '/api/settings';
const MQPusher = require('../plugins/MQPusher');

const SettingsService = function (app) {
    
    /**
     * 获取全局设置
     */
    app.get(`${BASE_PATH}/get`, (request, response) => {
        const dto = new DTO([
            {
                id: 1,
                key: "FRIENDSHIP",
                title: "好友申请自动通过回复语",
                option: `你好，光链小助手欢迎你！
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
                KKcoin: www.kkcoin.com`
            }
        ]);
        response.json(dto.toJSON());
    });

    /**
     * 根据key更新全局设置
     */
    app.post(`${BASE_PATH}/update/:key`, (request, response) => {
        const {key, option} = request.body;
        if(isEmpty(key) || isEmpty(option)) {
            resposne.json(DTO.PARAMS_ERR);
            response.end();
        }

        let $sql = ` SELECT COUNT(1) AS total FROM setting WHERE key = ?`;
        try {
            _pool_connection_format($sql, [key], res => {
                if(res) {
                    if(res[0].total === 1) {
                        $sql = ` UPDATE setting SET option = ? WHERE key = ?`;
                        _pool_connection_format($sql, [option, key], __res => {
                            if(__res) {
                                const dto = new DTO(__res.changedRows === 1);
                                response.json(dto.toJSON());
                            } else {
                                throw `update setting ${key} fail.`;
                            }
                        });
                    } else {
    
                    }
                } else {
                    throw `update setting ${key} fail.`;
                }
            })
        } catch(e) {
            TIMEOUT(response, e.message);
        }
    });
}

module.exports = SettingsService
