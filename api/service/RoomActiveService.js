const { _pool_connection, _pool_connection_format, format } = require('./DB');
const { info: log, err } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/stat/roomactive';

const RoomActiveService = function (app) {
    /**
     * 群活跃列表接口按群
     */
    app.post(`${BASE_PATH}/list`, (request, response) => {
        let { roomid, start, end } = request.body;
        let $sql = 'SELECT date,type,info FROM stat_room_active WHERE 1=1 ';
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
            params.push(_time.format('YYYY-MM-DD'));
            $sql += ' AND date >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD'));
            $sql += ' AND date <= ?';
        }
        $sql += ' order by date desc ';
        _pool_connection_format($sql, params, rs => {
            if (rs !== false) {
                const dto = new DTO();
                let resObj = {};
                rs.forEach(it => {
                    let date = Utils.formatDate(it.date, 'YYYY-MM-DD');
                    if (resObj[date] === undefined || resObj[date] === null) {
                        resObj[date] = {};
                    }
                    resObj[date][it.type] = it.info;
                });
                resObj = Utils.completDate({
                    start,
                    end,
                    resObj,
                    attrs: ["1", "7", "30"]
                })
                let res = [];
                for (let date in resObj) {
                    res.push({
                        date: date,
                        "日活": resObj[date]['1'] || 0,
                        "周活": resObj[date]['7'] || 0,
                        "月活": resObj[date]['30'] || 0,
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
     * 群活跃列表接口按活跃
     */
    app.post(`${BASE_PATH}/listbyactive`, (request, response) => {
        let { type, start, end } = request.body;
        let params = [];
        let $sql = 'SELECT a.date,b.topic,a.info FROM stat_room_active a left join (select roomid,topic from room order by id asc limit 10 ) b on a.roomid=b.roomid where 1=1  ';
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD'));
            $sql += ' AND a.date >= ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD'));
            $sql += ' AND a.date <= ?';
        }
        $sql += ' order by a.date desc ';
        let $roomListSql = 'select topic from room order by id asc limit 10';
        _pool_connection($roomListSql, rs => {
            if (rs !== false) {
                const dto = new DTO();
                let roomList = [];
                rs.forEach(it => {
                    roomList.push(it.topic)
                });
                //查询主题
                _pool_connection_format($sql, params, rs => {
                    if (rs !== false) {
                        const dto = new DTO();
                        let resObj = {};
                        rs.forEach(it => {
                            let date = Utils.formatDate(it.date, 'YYYY-MM-DD');
                            if (resObj[date] === undefined || resObj[date] === null) {
                                resObj[date] = {};
                            }
                            resObj[date][it.topic] = it.info;
                        });
                        resObj = Utils.completDate({
                            start,
                            end,
                            resObj,
                            attrs: roomList
                        })
                        let res = [];
                        for (let date in resObj) {
                            let tmp = {};
                            for (let topic in roomList) {
                                tmp[roomList[topic]] = resObj[date][roomList[topic]] || 0;
                            }
                            res.push({
                                date: date,
                                data: tmp,
                            })
                        };
                        dto.set(res);
                        response.json(dto.toJSON());
                    } else {
                        response.json(DTO.TIMEOUT_ERR);
                    }
                })
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })


    });
    /**
     * 群活跃列表接口按日
     */
    app.post(`${BASE_PATH}/listbydate`, (request, response) => {
        let { date } = request.body;
        let params = [];
        let $sql = 'SELECT a.type,b.topic,a.info FROM stat_room_active a left join (select roomid,topic from room order by id asc limit 10 ) b on a.roomid=b.roomid where 1=1  ';
        if (typeof date == 'string' && Utils.isNotEmpty(date)) {
            let _time = Utils.moment(date);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${date}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD'));
            $sql += ' AND a.date = ?';
        }
        let $roomListSql = 'select topic from room order by id asc limit 10';
        _pool_connection($roomListSql, rs => {
            if (rs !== false) {
                const dto = new DTO();
                let roomList = [];
                rs.forEach(it => {
                    roomList.push(it.topic)
                });
                //查询主题
                _pool_connection_format($sql, params, rs => {
                    if (rs !== false) {
                        const dto = new DTO();
                        let resObj = {};
                        rs.forEach(it => {
                            if (resObj[it.topic] === undefined || resObj[it.topic] === null) {
                                resObj[it.topic] = {};
                            }
                            resObj[it.topic][it.type] = it.info;
                        });
                        let res = [];
                        //补全群
                        for (let topic in roomList) {
                            let tmp = {}
                            tmp[roomList[topic]] = {}
                            if (resObj[roomList[topic]] === undefined || resObj[roomList[topic]] === null) {
                                tmp[roomList[topic]][1] = tmp[roomList[topic]][7] = tmp[roomList[topic]][30] = 0;
                            } else {
                                //补全日月周
                                tmp[roomList[topic]][1] = resObj[roomList[topic]][1] || 0;
                                tmp[roomList[topic]][7] = resObj[roomList[topic]][7] || 0;
                                tmp[roomList[topic]][30] = resObj[roomList[topic]][30] || 0;
                            }
                            res.push(tmp);
                        }
                        dto.set(res);
                        response.json(dto.toJSON());
                    } else {
                        response.json(DTO.TIMEOUT_ERR);
                    }
                })
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })


    });
};

module.exports = RoomActiveService;
