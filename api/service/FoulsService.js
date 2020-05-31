const { _pool_connection_format } = require('./DB');
const Utils = require('../plugins/Utils');
const DTO = require('../plugins/DataTransferObject');
const Pagination = require('../plugins/Pagination');
const BASE_PATH = '/api/fouls';

const FoulsService = function(app) {
    app.post(`${BASE_PATH}/page`, (request, response) => {
        if (Utils.isEmpty(request.body)) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let { roomid, wechatId, contactName, contactId, keyword, keywordId, pageno, pagesize } = Utils.handlePageParams(request.body);
        const pagination = new Pagination();
        let $sql = `
SELECT count(1) AS total 
FROM 
    fouls f 
    LEFT JOIN contact c ON c.wechat_id = f.wechat_id AND c.roomid = f.roomid 
    LEFT JOIN room r ON r.roomid = f.roomid
    LEFT JOIN chats ch ON ch.id = f.chat_id
    LEFT JOIN keywords k ON k.id = f.keyword_id 
WHERE f.deleted IS NULL`;
        let params = [];
        //群组
        if (Utils.isNotEmpty(roomid)) {
            params.push(roomid);
            $sql += ' AND f.roomid = ?';
        }

        // 微信用户
        if (Utils.isNotEmpty(wechatId)) {
            params.push(wechatId);
            $sql += ' AND f.wechat_id = ?';
        }
        if (Utils.isNotEmpty(contactName)) {
            params.push(contactName);
            $sql += ' AND c.name LIKE CONCAT("%",?,"%")';
        }
        if (Utils.isNotEmpty(contactId)) {
            params.push(contactId);
            $sql += ' AND c.id = ?';
        }

        // 关键词
        if (Utils.isNotEmpty(keyword)) {
            params.push(keyword);
            $sql += ' AND k.keyword LIKE CONCAT("%",?,"%")';
        }
        if (Utils.isNotEmpty(keywordId)) {
            params.push(keywordId);
            $sql += ' AND f.keyword_id = ?';
        }
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                pagination.setTotal(res[0].total);
                $sql = $sql.replace('count(1) AS total', 'f.*, c.name AS contactName, c.id AS contactId, ch.content AS content, k.keyword AS keyword, r.topic AS topic');
                $sql += ' ORDER BY f.created DESC LIMIT ?,?';
                params.push(pageno * pagesize);
                params.push(pagesize);
                _pool_connection_format($sql, params, rs => {
                    if (rs !== false) {
                        rs.forEach(it => {
                            it.created = Utils.formatDate(it.created);
                            it.updated = Utils.formatDate(it.dele);
                        });
                        pagination.setPageList(rs);
                        pagination.setPageno(pageno);
                        pagination.setPagesize(pagesize);
                        let dto = new DTO(pagination.toJSON());
                        response.json(dto.toJSON());
                    } else {
                        throw 'FoulService api page line 73.';
                    }
                });
            } else {
                throw 'FoulService api page line 77.';
            }
        });
    });

    /**
     * 备注
     */
    app.post(`${BASE_PATH}/bak`, (request, response) => {
        let { bak = '', id } = request.body;
        if (typeof id !== 'number' || isNaN(id) || id <= 0) {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = 'UPDATE fouls SET bak = ?, operator_id = ? WHERE id = ?';
        let params = [bak, request.session.user.id, id];
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                let dto = new DTO(0, '操作成功', res.changedRows);
                response.json(dto.toJSON());
            } else {
                throw 'FoulService api bak error.';
            }
        });
    });

    /**
     * 撤销违规
     */
    app.post(`${BASE_PATH}/revoke`, (request, response) => {
        let { bak = '', id } = request.body;
        if (Utils.isEmpty(bak) || typeof id !== 'number') {
            response.json(DTO.PARAMS_ERR);
            return;
        }
        let $sql = 'UPDATE fouls SET bak = ?, operator_id = ?, deleted = NOW() WHERE id = ?';
        let params = [bak, request.session.user.id, id];
        _pool_connection_format($sql, params, res => {
            if (res !== false) {
                let dto = new DTO(0, '操作成功', res.changedRows);
                response.json(dto.toJSON());
            } else {
                throw 'FoulService api revoke error.';
            }
        });
    });
}

module.exports = FoulsService;