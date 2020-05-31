const { _pool_connection, _pool_connection_format, format } = require('./DB');
const { info: log, err, TIMEOUT } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/home';

const HomeService = function (app) {
    /**
     * 首页统计
     */
    app.post(`${BASE_PATH}/stat`, (request, response) => {

        const promises = [];
        // 累计用户数
        promises.push(new Promise((resolve, reject) => {
            let $sql = ` SELECT COUNT(distinct wechat_id) AS num  FROM contact `;
            _pool_connection($sql, res => {
                if (res !== false) {
                    resolve(res);
                } else {
                    reject(res);
                }
            })
        }))

        // 月新增
        promises.push(new Promise((resolve, reject) => {
            let month = Utils
                .moment()
                .subtract(30, 'day')
                .format('YYYY-MM-DD 00:00:00');
            let $sql = ` SELECT COUNT(distinct wechat_id) AS num  FROM contact WHERE created > '${month}' `;
            _pool_connection($sql, res => {
                if (res !== false) {
                    resolve(res);
                } else {
                    reject(res);
                }
            })
        }))

        // 关键词曝光总数
        promises.push(new Promise((resolve, reject) => {
            let $sql = ` SELECT COUNT(1) AS num FROM keywords_chat_ref c left join keywords k on c.keyword_id =k.id where k.type=1 `;
            _pool_connection($sql, res => {
                if (res !== false) {
                    resolve(res);
                } else {
                    reject(res);
                }
            })
        }))

        // 昨日 日活，周活，月活
        promises.push(new Promise((resolve, reject) => {
            let yesterday = Utils
                .moment()
                .subtract(1, 'day')
                .format('YYYY-MM-DD');
            let $sql = ` SELECT type,info FROM stat_total_active WHERE date = '${yesterday}'`;
            _pool_connection($sql, res => {
                if (res !== false) {
                    resolve(res);
                } else {
                    reject(res);
                }
            })
        }))
        Promise
            .all(promises)
            .then(res => {
                // data handle index get res
                const dto = new DTO();
                let tmp = {};
                tmp['total'] = res[0][0]['num'] || 0;
                tmp['inc'] = res[1][0]['num'] || 0;
                tmp['keywords'] = res[2][0]['num'] || 0;
                if (res[3].length === 0) {
                    tmp['1'] = tmp['7'] = tmp['30'] = 0;
                } else {
                    res[3].forEach(it => {
                        tmp[it.type] = it.info;
                    });
                }
                dto.set(tmp);
                response.json(dto.toJSON());
            })
            .catch(err => {
                TIMEOUT(response, err);
            })
    });

};

module.exports = HomeService;