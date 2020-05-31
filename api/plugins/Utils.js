const jsmicro_is_empty = require('jsmicro-is-empty');
const DTO = require('./DataTransferObject');
const moment = require('moment');
const isEmpty = (val) => {
    if(typeof val === 'number') {
        return false;
    } else {
        return jsmicro_is_empty.isEmpty(val);
    }
}

const isNotEmpty = (val) => {
    if(typeof val === 'number' && !isNaN(val)) {
        return true;
    } else {
        return jsmicro_is_empty.isNotEmpty(val);
    }
}

const checkAuthority = (req, res) => {
    let user = req.session.user;
    if (isEmpty(user)) {
        res.json(DTO.FORBIDDEN_ERR);
        return true;
    }
    if (user.authority !== 'admin') {
        res.json(DTO.FORBIDDEN_ERR);
        return true;
    }
    return false;
};

const formatDate = (date, formatter = 'YYYY-MM-DD HH:mm:ss') => {
    return moment(date).format(formatter);
};

const handlePageParams = (body) => {
    let { pageno, pagesize } = body;
    if (typeof pageno != 'number') pageno = parseInt(pageno);
    if (typeof pagesize != 'number') pagesize = parseInt(pagesize);
    pageno = isNaN(pageno) ? 0 : pageno;
    pagesize = isNaN(pagesize) ? 15 : pagesize;
    if (pagesize > 50) pagesize = 15;
    return {
        pageno,
        pagesize,
        ...body
    };
}

/**
 * 统计分析完善结果数据
 * @param {Moment | String} start 开始时间 required
 * @param {Moment | String} end 结束时间 required
 * @param {JSONObject} resObj 待处理数据 
 * @param {Array} attrs 数据维度 
 */
const completDate = ({start, end, resObj = {}, attrs = ['1', '7', '30']}) => {
    let res = {};
    start = moment(start);
    end = moment(end);
    let diff = end.diff(start, 'day');
    for(let i = 0; i <= diff; i++, end.subtract(1, 'day')) {
        let date = end.format('YYYY-MM-DD');
        if(resObj[date] === undefined || resObj[date] === null) {
            res[date] = {};
            attrs.forEach(it => res[date][it] = 0);
        } else {
            res[date] = resObj[date];
        }
    }
    return res;
}

module.exports = {
    isEmpty,
    isNotEmpty,
    moment,
    checkAuthority,
    formatDate,
    handlePageParams,
    completDate
};