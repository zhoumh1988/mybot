const parseurl = require('parseurl');
const DTO = require('./DataTransferObject');
const {
    checkAuthority,
    isEmpty
} = require('./Utils');
const {
    info
} = require('./Log');

/**
 * 封装get请求参数
 */
const handleQuery = (req, query) => {
    if (typeof query == 'string' && query.length != 0 && query !== '?') {
        let body = req.body || {};
        query = query.indexOf('?') == -1 ? query : query.substring(1);
        query.split('&').forEach(it => {
            let p = it.split('=');
            body[p[0]] = p[1] || null;
        });
        req.body = body;
    }
}

const interceptors = {
    /* 包含接口 */
    includes: [
        /\/api\/account\/reset\/pwd\/[\d]/,
        /\/api\/account\/delete\/[\d]/,
        /\/api\/account\/create/,
        /\/api\/account\/page/,
        /\/api\/room\/owner/,
        /\/api\/room\/manager/,
    ],
    /* 排除 */
    excludes: [
        '/api/login',
        '/api/logout'
    ]
}
const SessionInterceptor = (req, res, next) => {
    const request = parseurl(req);
    info.info(`[${req.method}]请求接口：${request.pathname}`);
    req.session.lastPage = request.pathname;
    if (interceptors.excludes.indexOf(request.pathname) === -1 && isEmpty(req.session.user)) {
        // 未登录判断
        res.json(DTO.NOT_LOGIN_ERR);
    } else {
        // 接口鉴权
        interceptors.includes.forEach(it => {
            let reg = new RegExp(it);
            if (reg.test(request.pathname) && checkAuthority(req, res)) {
                info.warn(`user[${req.session.user.name}](${req.session.user.id}) request ${request.pathname} is limited`);
                return;
            };
        });
        // 刷新session过期时间
        req.session._garbage = Date();
        req.session.touch();
        // 统一封装请求参数
        if (req.method === 'GET') {
            handleQuery(req, request.query);
        }
        next();
    }
}

module.exports = SessionInterceptor;