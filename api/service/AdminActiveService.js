const { _pool_connection_format } = require('./DB');
const { info: log, err } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/stat/adminactive';

const AdminActiveService = function (app) {
    /**
     * 管理员活跃列表接口
     */
    app.post(`${BASE_PATH}/line`, (request, response) => {
        let { start, end } = Utils.handlePageParams(request.body);
        let $sql = 'SELECT date,type,info FROM stat_admin_active WHERE 1=1 ';
        let params = [];
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
                        "月活": resObj[date]['30'] || 0
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
    * 管理员活跃分页接口
    */
    app.post(`${BASE_PATH}/page`, (request, response) => {
        const dto = new DTO();
        const pagination = new Pagination();
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = 'SELECT count(1) AS total FROM stat_admin_active WHERE 1=1 ';
        let { pageno, pagesize, start, end } = Utils.handlePageParams(request.body);
        let params = [];
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND date > ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND date <= ?';
        }
        _pool_connection_format($sql, params, rs => {
            try {
                if (rs !== false) {
                    pagination.setTotal(rs[0].total / 3);
                    $sql = $sql.replace('count(1) AS total', 'type,date,info');
                    $sql += ' ORDER BY date DESC LIMIT ?,?';
                    params.push(pageno * pagesize * 3);
                    params.push(pagesize * 3);
                    _pool_connection_format($sql, params, rs => {
                        try {
                            if (rs !== false) {
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
                                        date: date, "日活": resObj[date]['1'], "周活": resObj[date]['7'], "月活": resObj[date]['30']
                                    })
                                };
                                pagination.setPageList(res);
                                pagination.setPageno(pageno);
                                pagination.setPagesize(pagesize);
                                dto.set(pagination.toJSON());
                            } else {
                                dto.set(400, '请求超时，请重试');
                            }
                            response.json(dto.toJSON());
                        } catch (e) {
                            err.error(e);
                        }
                    });
                } else {
                    dto.set(400, '请求超时，请重试');
                }
            } catch (e) {
                err.error(e);
            }
        });
    });

};

module.exports = AdminActiveService;
