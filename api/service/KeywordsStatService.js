const {
    _pool_connection,
    _pool_connection_format,
    format
} = require('./DB');
const {
    err
} = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const BASE_PATH = '/api/stat/keywords';

const KeywordsStatService = function (app) {

    /**
     * 获取关键词曝光列表
     */
    const getKeywordsTable = ({
        roomid,
        start,
        end
    }, callback) => {
        let $sql = `SELECT count(1) AS num, k.keyword FROM keywords_chat_ref AS b LEFT JOIN chats c ON b.chat_id = c.id LEFT JOIN keywords k ON b.keyword_id = k.id WHERE 1=1 AND k.type = 1 `;
        params = [];
        if (typeof roomid == 'string' && Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND c.roomid = ? ';
        }
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND b.created >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND b.created <= ?';
        }
        $sql += ` GROUP BY b.keyword_id ORDER BY num DESC`;
        _pool_connection_format($sql, params, rs => {
            if (rs !== false) {
                rs.forEach(it => {
                    it.count = it.num;
                });
                callback(rs);
            }
        });
    }

    /**
     * 关键词列表接口
     */
    app.post(`${BASE_PATH}/line`, (request, response) => {
        let {
            roomid,
            start,
            end
        } = request.body;
        let $sql = " select count(1) as num,date from (SELECT DATE_FORMAT(b.created,'%Y-%m-%d') as d" +
            "ate FROM keywords_chat_ref as b left join chats c on b.chat_id=c.id  left join k" +
            "eywords k on b.keyword_id =k.id WHERE 1=1 AND k.type = 1 ";
        let params = [];
        if (typeof roomid == 'string' && Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND c.roomid = ? ';
        }
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND b.created >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND b.created <= ?';
        }
        $sql += ' order by b.created desc ) as a group by date ';

        _pool_connection_format($sql, params, rs => {
            if (rs !== false) {
                const dto = new DTO();
                let resObj = {};
                rs.forEach(it => {
                    let date = Utils.formatDate(it.date, 'YYYY-MM-DD');
                    if (resObj[date] === undefined || resObj[date] === null) {
                        resObj[date] = {};
                    }
                    resObj[date]['count'] = it.num;
                });
                resObj = Utils.completDate({
                    start,
                    end,
                    resObj,
                    attrs: ["count"]
                })
                let res = [];
                for (let date in resObj) {
                    res.push({
                        date: date,
                        count: resObj[date]['count']
                    })
                };
                getKeywordsTable(request.body, table => {
                    dto.set({
                        list: res,
                        table: table
                    });
                    response.json(dto.toJSON());
                });
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });

    /**
     * 关键词曝光柱状图
     */
    app.post(`${BASE_PATH}/columnar`, (request, response) => {
        const dto = new DTO();
        let $sql = 'SELECT count(1) as count,k.keyword FROM keywords_chat_ref c left join keywords k' +
            ' on c.keyword_id=k.id where k.type=1 group by c.keyword_id order by count desc ';
        _pool_connection($sql, rs => {
            try {
                if (rs !== false) {
                    let res = [];
                    rs.forEach(it => {
                        res.push({
                            item: it.keyword,
                            count: it.count
                        });
                    });
                    dto.set(res);
                    response.json(dto.toJSON());
                } else {
                    dto.set(400, '请求超时，请重试');
                }
            } catch (e) {
                err.error(e);
            }
        });
    });

};

module.exports = KeywordsStatService;