const {_pool_connection_format} = require('./DB');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const BASE_PATH = '/api/stat/chats';

// 格式化时间
const formatDatetime = (date, type) => {
    if (type === 1) {
        return Utils.formatDate(date, 'YYYY-MM-DD');
    } else {
        return String(parseInt(date, 10));
    }
}

const ChatsStatService = function (app) {
    /**
     * 发言统计
     * @param {String} roomid 房间（群）roomid
     * @param {String} start 开始时间
     * @param {String} end 结束时间
     * @param {Integer} timeType 1-按日统计； 2-按小时统计
     */
    app.post(`${BASE_PATH}/line`, (request, response) => {
        let {roomid, start, end, timeType = 1} = request.body;
        const formater = timeType === 1 ? '%Y-%m-%d' : '%H';
        let $sql = `SELECT count(1) AS num,date FROM (SELECT DATE_FORMAT(ch.created, '${formater}') AS date FROM chats AS ch WHERE 1=1`;
        let params = [];
        if (typeof roomid == 'string' && Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND ch.roomid = ? ';
        }
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND ch.created >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND ch.created <= ?';
        }
        $sql += ` ORDER BY ch.created DESC) AS a GROUP BY date`;

        _pool_connection_format($sql, params, rs => {
            if (rs !== false) {
                const dto = new DTO();
                let resObj = {};
                rs.forEach(it => {
                    let date = formatDatetime(it.date, timeType);
                    if (resObj[date] === undefined || resObj[date] === null) {
                        resObj[date] = {};
                    }
                    resObj[date]['count'] = it.num;
                });
                let res = []
                if (timeType === 1) {
                    // 补全数据
                    resObj = Utils.completDate({start, end, resObj, attrs: ['count']});
                    res = [];
                    for (let date in resObj) {
                        res.push({date: date, count: resObj[date]['count'] })
                    };
                } else {
                    for(let i = 0 ; i < 24; i++) {
                        res.push({date: Utils.moment(i, 'H').format('HH:00'), count: resObj.hasOwnProperty(i) ? resObj[i].count : 0})
                    }
                }
                dto.set(res);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });
};

module.exports = ChatsStatService;