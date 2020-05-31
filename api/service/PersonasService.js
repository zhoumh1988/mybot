const { _pool_connection_format, format } = require('./DB');
const { err } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const BASE_PATH = '/api/stat/personas';

const KeywordsStatService = function (app) {
    /**
     * 性别列表接口
     */
    app.post(`${BASE_PATH}/line`, (request, response) => {
        let { roomid, start, end } = request.body;
        let $sql = " select count(distinct wechat_id) as num,date,gender from (SELECT  wechat_id,gender,DATE_FORMAT(created,'%Y-%m-%d') as date FROM  contact where 1=1 ";
        let params = [];
        if (typeof roomid == 'string' && Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND  roomid = ? ';
        }
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND created >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND  created <= ?';
        }
        $sql += ' ) as a group by date,gender ';

        _pool_connection_format($sql, params, rs => {
            if (rs !== false) {
                const dto = new DTO();
                let resObj = {};
                rs.forEach(it => {
                    let date = Utils.formatDate(it.date, 'YYYY-MM-DD');
                    if (resObj[date] === undefined || resObj[date] === null) {
                        resObj[date] = {};
                    }
                    resObj[date][it.gender] = it.num;
                });
                resObj = Utils.completDate({ start, end, resObj, attrs: [0, 1, 2] })
                let res = [];
                for (let date in resObj) {
                    res.push({
                        date: date,
                        '未知': resObj[date][0] || 0,
                        '男': resObj[date][1] || 0,
                        '女': resObj[date][2] || 0,
                    })
                };
                dto.set(res);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });

    /**
    * 用户画像性别柱状图
    */
    app.post(`${BASE_PATH}/gender`, (request, response) => {
        let { roomid, start, end } = request.body;
        const dto = new DTO();
        let $sql = 'SELECT count(DISTINCT wechat_id) as count,gender FROM contact where 1=1 AND gender != 0 ';
        let params = [];
        if (typeof roomid == 'string' && Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND roomid = ? ';
        }
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND created >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND created <= ?';
        }
        $sql += ' group by gender';
        _pool_connection_format($sql, params, rs => {
            try {
                if (rs !== false) {
                    let resObj = {};
                    rs.forEach(it => {
                        if (it.gender == 0) {
                            resObj['未知'] = it.count;
                        }
                        if (it.gender == 1) {
                            resObj['男'] = it.count;
                        }
                        if (it.gender == 2) {
                            resObj['女'] = it.count;
                        }

                    });
                    let res = [];
                    for (let item in resObj) {
                        res.push({ item: item, count: resObj[item] });
                    };
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