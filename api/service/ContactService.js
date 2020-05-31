const { _pool_connection, _pool_connection_format } = require('./DB');
const { info, err } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/contact';

const ContactService = function(app) {
    app.get(`${BASE_PATH}/get/:id`, (request, response) => {
        let id = parseInt(request.params.id || 0);
        if (isNaN(id) || id == 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        let $sql = `SELECT * FROM contact WHERE id = ${id}`;
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
     * 微信用户列表接口
     */
    app.get(`${BASE_PATH}/list`, (request, response) => {
        let { roomid, role } = request.body;
        let $sql = 'SELECT id, name FROM contact WHERE 1=1';
        let params = [];
        if (Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND roomid = ?';
        }
        if (Utils.isNotEmpty(role)) {
            params.push(role);
            $sql += ' AND role = ?';
        }
        $sql += ' ORDER BY CONVERT(`name` USING gbk)';
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                const dto = new DTO();
                dto.set(res);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        });
    });

    /**
     * 微信用户列表接口
     */
    app.get(`${BASE_PATH}/listContact`, (request, response) => {
        let { roomid, role } = request.body;
        let $sql = 'SELECT wechat_id AS id, name FROM contact WHERE 1=1';
        let params = [];
        if (Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND roomid = ?';
        }
        if (Utils.isNotEmpty(role)) {
            params.push(role);
            $sql += ' AND role = ?';
        }
        $sql += ' ORDER BY CONVERT(`name` USING gbk)';
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                const dto = new DTO();
                dto.set(res);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        });
    });

    /**
     * 微信用户分页接口
     */
    app.post(`${BASE_PATH}/page`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        try {
            let { pageno, pagesize, name = '', roomid = '', role } = Utils.handlePageParams(request.body);
            const pagination = new Pagination();
            let $sql = `SELECT count(1) AS total FROM contact c LEFT JOIN room r ON c.roomid = r.roomid WHERE 1=1`;
            let params = [];
            if (Utils.isNotEmpty(name + '')) {
                params.push(name);
                $sql += ' AND c.name LIKE CONCAT("%", ?, "%")';
            }
            if (Utils.isNotEmpty(roomid + '')) {
                params.push(roomid);
                $sql += ' AND c.roomid = ?';
            }
            if (typeof role == 'number' && !isNaN(role)) {
                params.push(role);
                $sql += ' AND c.role = ?';
            }
            _pool_connection_format($sql, params, res => {
                if (res !== false) {
                    pagination.setTotal(res[0].total);
                    $sql = $sql.replace('count(1) AS total', 'c.*, r.topic');
                    $sql += ' ORDER BY c.created DESC LIMIT ?,?';
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
                                err.error(`ContactService api page line 133. ${e}`);
                                response.json(DTO.TIMEOUT_ERR);
                            }
                        } catch (e) {
                            err.error(`ContactService api page line 136. ${e}`);
                            response.json(DTO.TIMEOUT_ERR);
                        }
                    });
                } else {
                    err.error(`ContactService api page line 141. ${e}`);
                    response.json(DTO.TIMEOUT_ERR);
                }
            });
        } catch (e) {
            err.error(`ContactService api page line 145. ${e}`);
            response.json(DTO.TIMEOUT_ERR);
        }
    });
    /**
     * 设置微信用户角色
     * @param {Integer} id 微信用户id
     * @param {Integer} role 角色id 0-用户 1-水军 2-群管理员
     */
    app.post(`${BASE_PATH}/setRole`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let { id, role } = request.body;
        if (typeof role !== 'number' || role === 0 ||
            typeof id !== 'number' || id === 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = `UPDATE contact SET role = ${role} WHERE id = ${id}`;
        _pool_connection($sql, res => {
            if (res !== false) {
                let dto = new DTO(0, '操作成功！', res.changedRows);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });
};

module.exports = ContactService;