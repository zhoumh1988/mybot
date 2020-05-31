const {_pool_connection, _pool_connection_format} = require('./DB');
const {info, err} = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/keywords'

const KeywordsService = function (app) {
    /**
     * 获取详情
     */
    app.get(`${BASE_PATH}/get/:id`, (request, response) => {
        let dto = new DTO();
        try {
            let id = parseInt(request.params.id || 0);
            if (id == 0) {
                response.json(DTO.PARAMS_ERR);
                return;
            }
            let $sql = `SELECT id, keyword, reply, type, fit_type, status, created, updated,valid_start,valid_end FROM keywords WHERE id = ${id} AND status != 99`;
            _pool_connection($sql, res => {
                if (Utils.isEmpty(res)) {
                    response.json(dto.set(400, '未查找到记录').toJSON())
                } else {
                    response.json(res[0]);
                }
            });
        } catch (e) {
            response.json(DTO.PARAMS_ERR);
        }
    });

    /**
     * 删除关键词
     */
    app.get(`${BASE_PATH}/delete/:id`, (request, response) => {
        let dto = new DTO();
        try {
            let id = parseInt(request.params.id || 0);
            if (id === 0) {
                response.json(DTO.PARAMS_ERR);
                return;
            }
            let $sql = `UPDATE keywords SET status = 99, deleted = '${Utils
                .moment()
                .format('YYYY-MM-DD hh:mm:ss')}' WHERE id = ${id} AND deleted IS NULL`;
            _pool_connection($sql, res => {
                if (res.changedRows > 0) {
                    response.json(dto.set(0, '删除成功！', {}).toJSON());
                } else {
                    response.json(dto.set(400, '删除失败').toJSON());
                }
            });
        } catch (e) {
            response.json(DTO.PARAMS_ERR);
        }
    });

    /**
     * 更新接口
     */
    app.post(`${BASE_PATH}/update`, (request, response) => {
        let dto = new DTO();
        let record = request.body;
        if (Utils.isEmpty(record) 
            || Utils.isEmpty(record.id) 
            || Utils.isEmpty(record.keyword) 
            || Utils.isEmpty(record.status) 
            || Utils.isEmpty(record.type)
            || (record.type === 1 && (Utils.isEmpty(record.fit_type)||Utils.isEmpty(record.valid_start)||Utils.isEmpty(record.valid_start)))) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        if (record.keyword.length > 200) {
            dto.set(400, '关键词过长');
            response.json(dto.toJSON());
            return;
        }

        if (Utils.isNotEmpty(record.reply) && record.reply.length > 500) {
            dto.set(400, '回复过长');
            response.json(dto.toJSON());
            return;
        }
        uniqueKeyword(record, request, response).then(res => {
            if (res) {
                let params = [record.keyword, record.status];
                let attrs = ['keyword', 'status'];
                if (record.type === 1) {
                    attrs.push('reply');
                    params.push(record.reply);
                    attrs.push('fit_type');
                    params.push(record.fit_type);
                    attrs.push('valid_start');
                    params.push(record.valid_start)
                    attrs.push('valid_end')
                    params.push(record.valid_end)
                }
                params.push(record.id);
                let $sql = `UPDATE keywords SET ${attrs.map(it => it + ' = ? ')} WHERE id = ?`
                _pool_connection_format($sql, params, res => {
                    if(res !== false) {
                        dto.set(0, '操作成功', res.changedRows);
                        response.json(dto.toJSON());
                    } else {
                        response.json(DTO.TIMEOUT_ERR);
                    }
                });
            } else {
                dto.set(400, '关键词已存在');
                response.json(dto.toJSON());
            }
        });
    });

    /**
     * 验证唯一性
     */
    app.post(`${BASE_PATH}/unique`, (request, response) => {
        const {
            keyword,
            type
        } = request.body;
        if (Utils.isEmpty(keyword) || Utils.isEmpty(type)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        uniqueKeyword(request.body, request, response).then(res => {
            const dto = new DTO();
            if (res) {
                dto.set(0, '唯一性校验通过', 1);
            } else {
                dto.set(0, '当前关键词已存在', 0);
            }
            response.json(dto.toJSON());
        });
    });

    /**
     * @author LittleStrong
     * @description 校验关键词唯一性
     * @param {JSONObject} record 关键词
     * @return {Promise}
     */
    const uniqueKeyword = (record, request, response) => {
        return new Promise(function (resolve, reject) {
            let $sql = `SELECT COUNT(1) AS total FROM keywords WHERE keyword = ? AND type = ? AND deleted IS NULL`;
            let params = [record.keyword, record.type];
            if(Utils.isNotEmpty(record.fit_type)) {
                $sql += ' AND fit_type != ?';
                params.push(record.fit_type);
            }
            if(Utils.isNotEmpty(record.id)) {
                $sql += ' AND id != ?';
                params.push(record.id);
            }
            _pool_connection_format($sql, params, res => {
                if (res[0]) {
                    resolve(res[0].total === 0);
                } else {
                    reject(DTO.TIMEOUT_ERR);
                }
            });
        }).catch(err => {
            response.json(err);
            return false;
        });
    }

    /**
     * @description 添加关键词统一接口
     * @param {JSONObject} record
     * @param {DTO} dto
     * @param {Request} request
     * @param {Response} response
     */
    const insertKeyword = (record, dto, request, response) => {
        let attrs = ['keyword', 'fit_type', 'type', 'status'];
        if (record.type == 1) {
            attrs.push('reply');
            attrs.push('valid_start');
            attrs.push('valid_end');
        }
        let $sql = `INSERT INTO keywords (${attrs.join(',')}) values (${attrs.map(it => '?')})`;
        let params = attrs.map(it => record[it]);
        _pool_connection_format($sql, params, rs => {
            if (rs.insertId) {
                dto.set({id: rs.insertId});
            } else {
                dto.set(400, '添加失败');
            }
            response.json(dto.toJSON());
        });
    }

    /**
     * 新增常规关键词
     */
    app.post(`${BASE_PATH}/normal/create`, (request, response) => {
        let dto = new DTO();
        let record = request.body;
        if (Utils.isEmpty(record) 
            || Utils.isEmpty(record.keyword) 
            || Utils.isEmpty(record.reply) 
            || Utils.isEmpty(record.status)
            || Utils.isEmpty(record.valid_start)
            || Utils.isEmpty(record.valid_end)
            || Utils.isEmpty(record.fit_type)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        if (record.keyword.length > 200) {
            dto.set(400, '关键词过长');
            response.json(dto.toJSON());
            return;
        }

        if (record.reply.length > 500) {
            dto.set(400, '回复过长');
            response.json(dto.toJSON());
            return;
        }
        record.type = 1;
        uniqueKeyword(record, request, response).then(res => {
            if (res) {
                insertKeyword(record, dto, request, response);
            } else {
                dto.set(0, 400, '关键词已存在');
                response.json(dto.toJSON());
            }
        });
    });
    /**
     * 新增敏感关键词
     */
    app.post(`${BASE_PATH}/foul/create`, (request, response) => {
        let dto = new DTO();
        let record = request.body;
        if (Utils.isEmpty(record) 
            || Utils.isEmpty(record.keyword) 
            || Utils.isEmpty(record.status)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        if (record.keyword.length > 200) {
            dto.set(400, '关键词过长');
            response.json(dto.toJSON());
            return;
        }
        record.type = 2;
        record.fit_type = 2;
        uniqueKeyword(record, request, response).then(res => {
            if (res) {
                insertKeyword(record, dto, request, response);
            } else {
                dto.set(0, 400, '关键词已存在');
                response.json(dto.toJSON());
            }
        });
    });

    const page = ({
            pageno = 0,
            pagesize = 15,
            type = 1,
            keyword,
            status,
            fit_type,
            valid_start,
            valid_end
        }, response) => {
        const pagination = new Pagination();
        let $sql = 'SELECT count(1) AS total FROM keywords WHERE 1=1 AND status != 99 ';
        let params = [];
        params.push(type);
        $sql += ' AND type = ?';
        if (Utils.isNotEmpty(keyword)) {
            params.push(keyword);
            $sql += ' AND keyword LIKE CONCAT("%", ?, "%")';
        }
        if (Utils.isNotEmpty(status)) {
            params.push(status);
            $sql += ' AND status = ?';
        }
        if(Utils.isNotEmpty(fit_type)) {
            params.push(fit_type);
            $sql += ' AND fit_type = ?';
        }
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                pagination.setTotal(res[0].total);
                $sql = $sql.replace('count(1) AS total', 'id, keyword, reply, type, fit_type, status, created, updated,valid_start,valid_end');
                $sql += ' ORDER BY created DESC LIMIT ?,?';
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
                            return;
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
    }

    /**
     * 关键词分页接口
     */
    app.post(`${BASE_PATH}/normal/page`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        try {
            let {
                pageno,
                pagesize,
                keyword = '',
                status,
                fit_type,
                valid_start,
                valid_end
            } = Utils.handlePageParams(request.body);
            page({pageno, pagesize, type: 1, keyword, status, fit_type,valid_start,valid_end}, response);
        } catch (e) {
            response.json(DTO.PARAMS_ERR);
        }
    });

    /**
     * 敏感词分页接口
     */
    app.post(`${BASE_PATH}/foul/page`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        try {
            let {
                pageno,
                pagesize,
                keyword = '',
                status
            } = Utils.handlePageParams(request.body);
            page({pageno, pagesize, type: 2, keyword, status}, response);
        } catch (e) {
            response.json(DTO.PARAMS_ERR);
        }
    });
}

module.exports = KeywordsService;