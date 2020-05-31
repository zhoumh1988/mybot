/**
 * DataTransferObject
 * 返回结果统一封装
 *
 */
const DataTransferObject = function() {
    if (arguments.length == 1) {
        this.code = 0;
        this.msg = '';
        this.data = arguments[0];
    } else if (arguments.length == 2) {
        this.code = arguments[0];
        this.msg = arguments[1];
        this.data = {};
    } else if (arguments.length == 3) {
        this.code = arguments[0];
        this.msg = arguments[1];
        this.data = arguments[2];
    } else {
        this.code = 0;
        this.msg = '';
        this.data = null;
    }
};

DataTransferObject.prototype.set = function() {
    if (arguments.length == 1) {
        this.code = 0;
        this.msg = '';
        this.data = arguments[0];
    } else if (arguments.length == 2) {
        this.code = arguments[0];
        this.msg = arguments[1];
        this.data = null;
    } else if (arguments.length == 3) {
        this.code = arguments[0];
        this.msg = arguments[1];
        this.data = arguments[2];
    } else {
        this.code = 0;
        this.msg = '';
        this.data = null;
    }
    return this;
};

DataTransferObject.prototype.setCode = function(code) {
    this.code = code;
};

DataTransferObject.prototype.setMsg = function(msg) {
    this.msg = msg;
};

DataTransferObject.prototype.setData = function(data) {
    this.data = data;
};

DataTransferObject.prototype.toJSON = function() {
    return {
        code: this.code,
        msg: this.msg,
        data: this.data,
    };
};

DataTransferObject.prototype.toString = function() {
    return `{code: ${this.code}, msg: "${this.msg}", data: ${JSON.stringify(this.data)}}`;
};

DataTransferObject.PARAMS_ERR = { code: 400, msg: '参数错误！', data: {} };
DataTransferObject.NOT_LOGIN_ERR = { code: 401, msg: '请登录后操作！', data: {} };
DataTransferObject.FORBIDDEN_ERR = { code: 403, msg: '您的账户无此操作权限！', data: {} };
DataTransferObject.NOT_FOUND_ERR = { code: 404, msg: '未找到接口！', data: {} }
DataTransferObject.TIMEOUT_ERR = { code: 500, msg: '请求超时，请重试！', data: {} };

module.exports = DataTransferObject;