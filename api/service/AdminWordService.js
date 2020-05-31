const { _pool_connection, _pool_connection_format, format } = require('./DB');
const { info: log, err } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/stat/adminword';

const AdminWordService = function (app) {
    /**
     * 管理员字数列表接口
     */
    app.post(`${BASE_PATH}/list`, (request, response) => {
        let { start, end } = Utils.handlePageParams(request.body);
        let $sql = 'SELECT date,type,info FROM stat_admin_word WHERE 1=1 ';
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
                    attrs: ['1', '5', '10', '20']
                })
                let res = [];
                for (let date in resObj) {
                    res.push({
                        date: date,
                        "1-5字": resObj[date]["1"] || 0,
                        "5-10字": resObj[date]["5"] || 0,
                        "10-20字": resObj[date]["10"] || 0,
                        "20字以上": resObj[date]["20"] || 0
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
    * 管理员字数饼图接口
    */
    app.post(`${BASE_PATH}/pie`, (request, response) => {
        const dto = new DTO();
        const pagination = new Pagination();
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = 'SELECT date,type,info FROM stat_admin_word WHERE 1=1 ';
        let { start, end } = request.body;
        let params = [];
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD '));
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
        _pool_connection_format($sql, params, rs => {
            try {
                if (rs !== false) {
                    let resObj = {};
                    resObj["1-5字"] = resObj["5-10字"] = resObj["10-20字"] = resObj["20字以上"] = 0;
                    rs.forEach(it => {
                        if (it.type == "1") {
                            resObj["1-5字"] += it.info;
                        }
                        if (it.type == "5") {
                            resObj["5-10字"] += it.info;
                        }
                        if (it.type == "10") {
                            resObj["10-20字"] += it.info;
                        }
                        if (it.type == "20") {
                            resObj["20字以上"] += it.info;
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

module.exports = AdminWordService;
