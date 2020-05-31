const {
    _pool_connection,
    _pool_connection_format
} = require('./DB');
const {
    err,
    TIMEOUT
} = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const MQPusher = require('../plugins/MQPusher');
const BASE_PATH = '/api/room';

const RoomService = function (app) {
    /**
     * 群组详情
     */
    app.get(`${BASE_PATH}/get/:id`, (request, response) => {
        let id = parseInt(request.params.id || 0);
        if (isNaN(id) || id == 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        let $sql = `SELECT * FROM room WHERE id = ${id}`;
        _pool_connection($sql, res => {
            if (res !== false) {
                let dto = new DTO();
                if (res.length > 0) {
                    res = res[0];
                    res.created = Utils.formatDate(res.created);
                    res.updated = Utils.formatDate(res.updated);
                    dto.set(res);
                    response.json(dto.toJSON());
                } else {
                    response.json(dto.set(400, '未查找到记录！'));
                }
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        });
    });

    /**
     * 群组列表接口
     */
    app.get(`${BASE_PATH}/list`, (request, response) => {
        let $sql = 'SELECT id, topic AS name FROM room';
        _pool_connection($sql, res => {
            if (res !== false) {
                const dto = new DTO();
                dto.set(res);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });

    /**
     * 群组列表接口
     * 返回roomid
     */
    app.get(`${BASE_PATH}/listRoom`, (request, response) => {
        let $sql = 'SELECT roomid AS id, topic AS name FROM room';
        _pool_connection($sql, res => {
            if (res !== false) {
                const dto = new DTO();
                dto.set(res);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });

    /**
     * 群组分页接口
     */
    app.post(`${BASE_PATH}/page`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        try {
            let {
                pageno,
                pagesize,
                topic = ''
            } = Utils.handlePageParams(request.body);
            const pagination = new Pagination();
            let $sql = 'SELECT count(1) AS total FROM room WHERE 1=1';
            let params = [];
            if (Utils.isNotEmpty(topic + '')) {
                params.push(topic);
                $sql += ' AND topic LIKE CONCAT("%", ?, "%")';
            }
            _pool_connection_format($sql, params, res => {
                if (res !== false) {
                    pagination.setTotal(res[0].total);
                    $sql = $sql.replace('SELECT count(1) AS total FROM room WHERE 1=1', `
SELECT 
    r.*, 
    a.name AS owner_name
FROM 
    room r 
    LEFT JOIN account a on r.owner_id = a.id 
WHERE 1=1
`);

                    $sql += ' LIMIT ?,?';
                    params.push(pageno * pagesize);
                    params.push(pagesize);
                    _pool_connection_format($sql, params, rs => {
                        try {
                            if (rs !== false) {
                                rs.forEach(it => {
                                    it.created = Utils.formatDate(it.created);
                                    it.updated = Utils.formatDate(it.updated);
                                });
                                pagination.setPageList(rs);
                                pagination.setPageno(pageno);
                                pagination.setPagesize(pagesize);
                                let dto = new DTO(pagination.toJSON());
                                response.json(dto.toJSON());
                            } else {
                                response.json(DTO.TIMEOUT_ERR);
                            }
                        } catch (e) {
                            err.error(e);
                            response.json(DTO.TIMEOUT_ERR);
                        }
                    });
                } else {
                    response.json(DTO.PARAMS_ERR);
                }
            });
        } catch (e) {
            response.json(DTO.PARAMS_ERR);
        }
    });

    /**
     * 设置群负责人（平台账户）
     */
    app.post(`${BASE_PATH}/owner`, (request, response) => {
        let {
            ownerId,
            id
        } = request.body;
        if (typeof ownerId !== 'number' || ownerId === 0 || typeof id !== 'number' || id === 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = `UPDATE room SET owner_id = ${ownerId} WHERE id = ${id}`;
        _pool_connection($sql, res => {
            if (res !== false) {
                let dto = new DTO();
                if (res.changedRows > 0) {
                    dto.set(0, '成功修改负责人！');
                } else {
                    dto.set(400, '修改负责人失败！');
                }
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        });
    });

    /**
     * 开启/关闭 日报/周报 推送开关～
     */
    app.post(`${BASE_PATH}/report`, (request, response) => {
        let {
            roomid,
            report
        } = request.body;
        console.log(`${roomid} typeof ${typeof roomid}`)
        console.log(`${report} typeof ${typeof report}`)
        if (Utils.isEmpty(roomid) || typeof roomid !== 'string' || Utils.isEmpty(report)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = ` UPDATE room SET is_report_day = ?, is_report_week = ? WHERE roomid = ? `;
        _pool_connection_format($sql, [report, report, roomid], res => {
            if (res !== false) {
                const dto = new DTO();
                if (res.changedRows == 1) {
                    try {
                        MQPusher.settingsPush({
                            roomid: roomid,
                            is_report_day: report,
                            is_report_week: report
                        })
                    } catch (e) {
                        err.error(e);
                    }
                    dto.setData(1);
                } else {
                    dto.setData(0);
                }
                response.json(dto.toJSON());
            } else {
                TIMEOUT(resposne, '请求超时');
            }
        })
    });
}

module.exports = RoomService;