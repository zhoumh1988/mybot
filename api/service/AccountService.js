const { _pool_connection, _pool_connection_format, format } = require('./DB');
const { info, err } = require('../plugins/Log');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/account';

const AccountService = function(app) {
    /**
     * 登录接口
     * @param {String} pwd 密码base64 + md5加密
     * @param {String} name 用户名|手机号|邮箱
     */
    app.post('/api/login', (request, response) => {
        let dto = new DTO();
        if (Utils.isEmpty(request.body.pwd) || Utils.isEmpty(request.body.name)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let params = [];
        params.push(request.body.pwd);
        params.push(request.body.name);
        params.push(request.body.name);
        params.push(request.body.name);
        _pool_connection_format(
            'SELECT id, name, mobile, email, authority FROM account WHERE status = 0 AND pwd = ? AND (name = ? OR mobile = ? OR email = ?)',
            params,
            rs => {
                try {
                    if (rs !== false) {
                        rs = rs[0];
                        if (Utils.isNotEmpty(rs)) {
                            request.session.user = rs;
                            dto.set(rs);
                        } else {
                            dto.set(400, '用户名或密码错误');
                        }
                    } else {
                        dto.set(400, '请求超时，请重试');
                    }
                    response.json(dto.toJSON());
                } catch (e) {
                    err.error(e);
                }
            }
        );
    });

    /**
     * 退出登录
     */
    app.get('/api/logout', (request, response) => {
        request.session.user = null;
        let dto = new DTO('账户退出登录');
        response.json(dto.toJSON());
    });

    /**
     * 用户列表接口
     */
    app.get(`${BASE_PATH}/list`, (request, response) => {
        let $sql = 'SELECT id, name FROM account WHERE status = 0 ORDER BY created DESC';
        _pool_connection($sql, rs => {
            if (rs !== false) {
                const dto = new DTO();
                dto.set(rs);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        })
    });

    /**
     * 用户管理分页接口
     */
    app.post(`${BASE_PATH}/page`, (request, response) => {
        const dto = new DTO();
        const pagination = new Pagination();
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = 'SELECT count(1) AS total FROM account WHERE 1=1';
        let { pageno, pagesize, name = '', mobile = '', email = '' , status,authority} = Utils.handlePageParams(request.body);
        let params = [];
        if (Utils.isNotEmpty(name)) {
            $sql += ' AND name LIKE CONCAT("%", ?, "%")';
            params.push(name);
        }
        if (Utils.isNotEmpty(mobile)) {
            $sql += ' AND mobile LIKE CONCAT("%", ?, "%")';
            params.push(mobile);
        }
        if (Utils.isNotEmpty(email)) {
            $sql += ' AND email LIKE CONCAT("%", ?, "%")';
            params.push(email);
        }
        if (Utils.isNotEmpty(status)) {
            $sql += ' AND status = ?';
            params.push(status);
        }
        if (Utils.isNotEmpty(authority)) {
            $sql += ' AND authority = ?';
            params.push(authority);
        }
        _pool_connection_format($sql, params, rs => {
            try {
                if (rs !== false) {
                    pagination.setTotal(rs[0].total);
                    $sql = $sql.replace('count(1) AS total', 'id, name, mobile, email, authority, status, created');
                    $sql += ' ORDER BY created DESC LIMIT ?,?';
                    params.push(pageno * pagesize);
                    params.push(pagesize);
                    _pool_connection_format($sql, params, rs => {
                        try {
                            if (rs !== false) {
                                rs.forEach(it => {
                                    it.created = Utils.moment(it.created).format('YYYY-MM-DD HH:mm:ss');
                                });
                                pagination.setPageList(rs);
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

    app.get(`${BASE_PATH}/:id`, (request, response) => {
        const dto = new DTO();
        const $sql = `SELECT id, name, mobile, email, status FROM account WHERE id = ${parseInt(
      request.params.id
    )}`;
        _pool_connection($sql, rs => {
            if (rs !== false) {
                if (Utils.isNotEmpty(rs[0])) {
                    dto.set(rs[0]);
                } else {
                    dto.set(400, '用户不存在');
                }
            } else {
                dto.set(400, '请求超时，请重试');
            }
            response.json(dto.toJSON());
        });
    });
    /**
     * 获取登录用户信息
     */
    app.get('/api/userInfo', (request, response) => {
        response.json(new DTO(request.session.user).toJSON());
    });

    /**
     * @description 修改用户密码
     */
    app.post(`${BASE_PATH}/modify/pwd`, (request, response) => {
        const dto = new DTO();
        let { pwd, newPwd } = request.body;
        if (Utils.isEmpty(pwd) || Utils.isEmpty(newPwd)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        if (pwd === newPwd) {
            dto.set(400, '新密码不能和旧密码一样。');
            response.json(dto.toJSON());
            return;
        }

        const $sql = `UPDATE account SET pwd = ? WHERE id = ? AND pwd = ?`;
        let params = [newPwd, request.session.user.id, pwd];
        _pool_connection_format($sql, params, rs => {
            if (rs.changedRows == 1) {
                dto.set('修改成功！');
            } else {
                dto.set(400, '密码修改失败！');
            }
            response.json(dto.toJSON());
        });
    });

    /**
     * 管理员重置密码 123456
     */
    app.get(`${BASE_PATH}/reset/pwd/:id`, (request, response) => {
        let dto = new DTO();
        let id = parseInt(request.params.id || 0);
        if (id == 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let params = ['e10adc3949ba59abbe56e057f20f883e', id];
        const $checkSql = `SELECT count(1) AS total FROM account WHERE pwd = ? AND id = ?`;
        _pool_connection_format($checkSql, params, res => {
            if(res !== false) {
                if(res[0] && res[0].total == 0) {
                    const $sql = `UPDATE account SET pwd = ? WHERE id = ?`;
                    _pool_connection_format($sql, params, rs => {
                        if(rs === false) {
                            dto.set(400, '密码重置失败！');
                        } else {
                            dto.set('重置成功！');
                        }
                        response.json(dto.toJSON());
                    });
                } else {
                    dto.set('重置成功！');
                    response.json(dto.toJSON());
                }
            } else {
                dto.set(400, '密码重置失败！');
                response.json(dto.toJSON());
            }
        });
    });
    /**
     * 修改手机号
     */
    app.post(`${BASE_PATH}/modify/mobile`, (request, response) => {
        let dto = new DTO();
        let { mobile } = request.body;
        if (Utils.isEmpty(mobile)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        if(request.session.user.mobile === mobile) {
            response.json(dto.set(0, '新手机号和原手机号一致'));
            return;
        }
        uniqueMobile({id: request.session.user.id, mobile}, response).then(res => {
            if(res) {
                const $sql = `UPDATE account SET mobile = ? WHERE id = ?`;
                let params = [mobile, request.session.user.id];
                _pool_connection_format($sql, params, rs => {
                    if (rs.changedRows == 1) {
                        request.session.user.mobile = mobile;
                        dto.set('手机号修改成功！');
                    } else {
                        dto.set(400, '手机号修改失败');
                    }
                    response.json(dto.toJSON());
                });
            } else {
                dto.set(400, `${mobile}手机号已存在`);
                response.json(dto.toJSON());
            }
        });
    });

    /**
     * 修改邮箱
     */
    app.post(`${BASE_PATH}/modify/email`, (request, response) => {
        let dto = new DTO();
        let { email } = request.body;
        if (Utils.isEmpty(email)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        if(request.session.user.email === email) {
            response.json(dto.set(0, '新邮箱和原邮箱一致'));
            return;
        }
        uniqueEmail({id: request.session.user.id, email}, response).then(res => {
            if(res) {
                const $sql = `UPDATE account SET email = ? WHERE id = ?`;
                let params = [email, request.session.user.id];
                _pool_connection_format($sql, params, rs => {
                    if (rs.changedRows > 0) {
                        request.session.user.email = email;
                        dto.set('邮箱修改成功！');
                    } else {
                        dto.set(400, '邮箱修改失败');
                    }
                    response.json(dto.toJSON());
                });
            } else {
                dto.set(400, `${email}邮箱已存在`);
                response.json(dto.toJSON());
            }
        })
    });

    /**
     * 注销账户
     */
    app.get(`${BASE_PATH}/delete/:id`, (request, response) => {
        try {
            let id = parseInt(request.params.id || 0);
            if (id == 0) {
                response.json(DTO.PARAMS_ERR);
                return;
            }
            let dto = new DTO();
            let $sql = `UPDATE account SET status = 2 WHERE id = ${id}`;
            _pool_connection($sql, rs => {
                if (rs.changedRows > 0) {
                    dto.set(0, '注销成功！', {});
                } else {
                    dto.set(400, '注销失败！');
                }
                response.json(dto.toJSON());
            });
        } catch (e) {
            response.json(DTO.TIMEOUT_ERR);
        }
    });

    /**
     * 新增平台账户
     */
    app.post(`${BASE_PATH}/create`, (request, response) => {
        let { name, pwd, mobile, email, authority } = request.body;

        if (typeof name != 'string' || name.length == 0 ||
            typeof mobile != 'string' || mobile.length == 0 ||
            typeof email != 'string' || email.length == 0 ||
            typeof authority != 'string' || authority.length == 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }

        if (typeof pwd != 'string' || pwd.length == 0) {
            pwd = 'e10adc3949ba59abbe56e057f20f883e';
        }

        let promises = [uniqueName({name}, response), uniqueMobile({mobile}, response), uniqueEmail({email}, response)];
        Promise.all(promises).then(res => {
            let check = res.every(_ => _);
            if(check) {
                let params = [name, pwd, mobile, email, authority];
                let $sql = 'INSERT INTO account (name, pwd, mobile, email, authority) VALUES (?,?,?,?,?)';
                _pool_connection_format($sql, params, rs => {
                    let dto = new DTO();
                    if (rs.insertId > 0) {
                        response.json(dto.set(0, '新增成功！', { id: rs.insertId }).toJSON());
                    } else {
                        response.json(dto.set(400, '新增平台账户失败！').toJSON());
                    }
                })
            } else {
                let dto = new DTO();
                if(!res[0]) {
                    dto.set(400, `${name}用户名已存在`);
                } else if(!res[1]) {
                    dto.set(400, `${mobile}手机号已存在`);
                } else if(!res[2]) {
                    dto.set(400, `${email}邮箱已存在`);
                }
                response.json(dto.toJSON());
            }
        }).catch(err => {
            response.json(err);
            return false;
        });
    });

    const uniqueEmail = ({id, email}, response) => {
        return new Promise(function (resolve, reject) {
            let $sql = `SELECT COUNT(1) AS total FROM account WHERE ${Utils.isNotEmpty(id) ? `id != ? AND` : ``} email = ?`;
            let params = [email];
            Utils.isNotEmpty(id) && params.unshift(id);
            _pool_connection_format($sql, params, res => {
                if(res !== false) {
                    resolve(res[0].total === 0);
                } else {
                    reject(DTO.TIMEOUT_ERR);
                }
            });
        });
    }

    const uniqueMobile = ({id, mobile}, response) => {
        return new Promise(function (resolve, reject) {
            let $sql = `SELECT COUNT(1) AS total FROM account WHERE ${Utils.isNotEmpty(id) ? `id != ? AND` : ``} mobile = ?`;
            let params = [mobile];
            Utils.isNotEmpty(id) && params.unshift(id);
            _pool_connection_format($sql, params, res => {
                if(res !== false) {
                    resolve(res[0].total === 0);
                } else {
                    reject(DTO.TIMEOUT_ERR);
                }
            });
        });
    }

    /**
     * 校验用户名是否存在
     */
    const uniqueName = ({id, name}, response) => {
        return new Promise(function (resolve, reject) {
            let $sql = `SELECT COUNT(1) AS total FROM account WHERE ${Utils.isNotEmpty(id) ? `id != ? AND` : ``} name = ?`;
            let params = [name];
            Utils.isNotEmpty(id) && params.unshift(id);
            _pool_connection_format($sql, params, res => {
                if(res !== false) {
                    resolve(res[0].total === 0);
                } else {
                    reject(DTO.TIMEOUT_ERR);
                }
            });
        });
    }

    /**
     * 校验属性唯一性
     */
    app.post(`${BASE_PATH}/unique/:prop`, (request, response) => {
        const dto = new DTO();
        let unique = null;
        const {value} = request.body;
        if(isEmpty(value)) {
            dto.set(0, '唯一性校验通过', 1);
            response.json(dto.toJSON());
            return;
        }
        let params = {
            id: request.body.id
        }
        switch(request.params.prop) {
            case 'name': 
                unique = uniqueName;
                params.name = request.body.value;
                break;
            case 'mobile': 
                unique = uniqueMobile;
                params.mobile = request.body.value;
                break;
            case 'email':
                unique = uniqueEmail;
                params.email = request.body.value;
                break;
            default:
                response.json(DTO.PARAMS_ERR);
                return;
        }

        unique(params, response).then(res => {
            if(res) {
                dto.set(0, '唯一性校验通过', 1);
            } else {
                dto.set(0, '当前关键词已存在', 0);
            }
            response.json(dto.toJSON());
        });
    });

    /**
     * 修改用户状态
     */
    app.post(`${BASE_PATH}/modify/status`, (request, response) => {
        const {id, status} = request.body;
        if(Utils.isEmpty(id) || Utils.isEmpty(status)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        const $sql = `UPDATE account SET status = ? WHERE id = ?`;
        const params = [status, id];
        _pool_connection_format($sql, params, res => {
            if(res!==false) {
                const dto = new DTO(0, `修改条数${res.changedRows}`, res.changedRows);
                response.json(dto.toJSON());
            } else {
                response.json(DTO.TIMEOUT_ERR);
            }
        });
    });
};

module.exports = AccountService;