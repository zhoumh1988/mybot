const {
    _pool_connection_format
} = require('./DB');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/chats';

const ChatsService = function (app) {
    /**
     * 获取聊天记录分页接口
     */
    app.post(`${BASE_PATH}/page`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let {
            roomid,
            role,
            type,
            start,
            end,
            content,
            pageno,
            pagesize
        } = Utils.handlePageParams(request.body);
        const pagination = new Pagination();
        let $sql = 'SELECT count(1) AS total FROM chats ch LEFT JOIN contact c ON c.wechat_id = ch.wechat_id AND c.roomid = ch.roomid LEFT JOIN room r ON c.roomid = r.roomid WHERE 1=1';
        let params = [];
        if (typeof roomid == 'string' && Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND ch.roomid = ?';
        }
        if (typeof type == 'number') {
            params.push(type);
            $sql += ' AND ch.type = ?';
        }
        if (typeof role == 'number') {
            params.push(role);
            $sql += ' AND c.role = ?';
        }
        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(_time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND ch.created > ?';
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
        if(Utils.isNotEmpty(content)) {
            params.push(content);
            $sql += ` AND ch.content LIKE CONCAT('%', ?, '%')`;
        }
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                pagination.setTotal(res[0].total);
                $sql = $sql.replace('count(1) AS total', 'ch.*, c.name AS contactName, c.id AS contactId, r.topic AS topic');
                $sql += ' ORDER BY ch.created DESC LIMIT ?,?';
                params.push(pageno * pagesize);
                params.push(pagesize);
                _pool_connection_format($sql, params, rs => {
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
                        throw 'ChatsService api page line 71.';
                    }
                });
            } else {
                throw 'ChatsService api page line 75.';
            }
        });
    });

    /**
     * 备注
     */
    app.post(`${BASE_PATH}/bak`, (request, response) => {
        let {
            bak = '', id
        } = request.body;
        if (typeof id != 'number' || isNaN(id) || id <= 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = 'UPDATE chats SET bak = ?, operator_id = ? WHERE id = ?';
        let params = [bak, request.session.user.id, id];
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                let dto = new DTO(0, '操作成功', res.changedRows);
                response.json(dto.toJSON());
            } else {
                throw 'ChatsService api bak error.';
            }
        });
    });

    /**
     * 聊天对话模式
     */
    app.post(`${BASE_PATH}/mode`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let {
            roomid,
            contacts = [],
            start,
            end,
            content,
            pageno,
            pagesize
        } = Utils.handlePageParams(request.body);
        if (typeof roomid !== 'string' || Utils.isEmpty(roomid)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        const pagination = new Pagination();
        let $sql = `
            SELECT count(1) AS total 
            FROM chats ch 
            LEFT JOIN contact c ON c.wechat_id = ch.wechat_id AND c.roomid = ch.roomid 
            LEFT JOIN images avatar ON c.avatar = avatar.id
            WHERE 1=1`;
        let params = [];
        params.push(roomid);
        $sql += ' AND ch.roomid = ?';

        if (Utils.isNotEmpty(contacts)) {
            let len = [];
            contacts.forEach(it => {
                params.push(it);
                len.push('?');
            });
            $sql += ` AND ch.wechat_id in (${len.join(',')})`;
        }

        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD HH:mm:ss`);
                response.json(dto.toJSON());
                return;
            }
            params.push(start);
            $sql += ' AND ch.created > ?';
        }

        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD HH:mm:ss`);
                response.json(dto.toJSON());
                return;
            }
            params.push(end);
            $sql += ' AND ch.created <= ?';
        }

        if(Utils.isNotEmpty(content)) {
            params.push(content);
            $sql += ` AND ch.content LIKE CONCAT('%', ?, '%')`;
        }

        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                pagination.setTotal(res[0].total);
                $sql = $sql.replace(
                    `count(1) AS total`,
                    `ch.id,
                    ch.type,
                    ch.roomid,
                    ch.content,
                    ch.created,
                    c.id AS contactId,
                    c.name AS contactName,
                    c.gender,
                    c.role,
                    avatar.img_base64 AS avatar`);
                $sql += ' ORDER BY ch.created DESC LIMIT ?,?';
                params.push(pageno * pagesize);
                params.push(pagesize);
                _pool_connection_format($sql, params, rs => {
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
                        throw 'ChatsService api page line 191.';
                    }
                });
            } else {
                throw 'ChatsService api page line 195.';
            }
        });
    });

    /**
     * 导出检索结果
     */
    app.post(`${BASE_PATH}/export`, (request, response) => {
        if(Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let {roomid, contacts, roles, start, end} = request.body;
        const params = [];
        let $sql = `
            SELECT r.topic, c.name, ch.content, ch.type, ch.created FROM 
                chats ch 
                LEFT JOIN room r ON ch.roomid = r.roomid 
                LEFT JOIN contact c ON ch.wechat_id = c.wechat_id AND ch.roomid = c.roomid
            WHERE 
                1 = 1
        `;

        if(Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND ch.roomid = ?';
        }

        if(Utils.isNotEmpty(contacts)) {
            contacts.forEach(c => params.push(c));
            $sql += ` AND ch.wechat_id in (${contacts.map(c => '?').join(',')})`;
        }

        if(Utils.isNotEmpty(roles)) {
            params.push(Array.isArray(roles) ? roles.join(',') : roles);
            $sql += ' AND c.role in (?)';
        }

        if (typeof start == 'string' && Utils.isNotEmpty(start)) {
            let _time = Utils.moment(start);
            if (!_time.isValid()) {
                let dto = new DTO(400, `开始时间格式错误：${start}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(start.indexOf(":") !== -1 ? start : _time.format('YYYY-MM-DD 00:00:00'));
            $sql += ' AND ch.created > ?';
        }
        if (typeof end == 'string' && Utils.isNotEmpty(end)) {
            let _time = Utils.moment(end);
            if (!_time.isValid()) {
                let dto = new DTO(400, `结束时间格式错误：${end}，正确格式：YYYY-MM-DD`);
                response.json(dto.toJSON());
                return;
            }
            params.push(end.indexOf(":") !== -1 ? end : _time.format('YYYY-MM-DD 23:59:59'));
            $sql += ' AND ch.created <= ?';
        }

        $sql += ' ORDER BY created';

        _pool_connection_format($sql, params, res => {
            if(res !== false) {
                res.forEach(it => {
                    it.created = Utils.formatDate(it.created);
                    switch(it.type) {
                        case 1:
                            it.type = 'Attachment';
                            break;
                        case 2:
                            it.type = 'Audio';
                            break;
                        case 3:
                            it.type = 'Contact';
                            break;
                        case 4:
                            it.type = 'ChatHistory';
                            break;
                        case 5:
                            it.type = 'Emoticon';
                            break;
                        case 6:
                            it.type = 'Image';
                            break;
                        case 7:
                            it.type = 'Text';
                            break;
                        case 8:
                            it.type = 'Location';
                            break;
                        case 9:
                            it.type = 'MiniProgram';
                            break;
                        case 10:
                            it.type = 'Money';
                            break;
                        case 11:
                            it.type = 'Recalled';
                            break;
                        case 12:
                            it.type = 'Url';
                            break;
                        case 13:
                            it.type = 'Video';
                            break;
                        default: 
                            it.type = 'Unknown';
                    }
                });
                const dto = new DTO(res);
                response.json(dto.toJSON());
            } else {
                resposne.json(DTO.TIMEOUT_ERR);
            }
        });

    });
}

module.exports = ChatsService;