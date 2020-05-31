const log4js = require('log4js');
const { LOGS_PATH } = require('../config');
const path = require('path');
const DTO = require('./DataTransferObject');

log4js.configure({
    appenders: {
        info: {
            type: 'dateFile',
            filename: path.resolve(LOGS_PATH, './API_INFO'),
            pattern: '_yyyy-MM-dd.log',
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category: 'log_date',
        },
        err: {
            type: 'dateFile',
            filename: path.resolve(LOGS_PATH, './API_ERROR'),
            pattern: '_yyyy-MM-dd.log',
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category: 'log_date',
        },
        query: {
            type: 'dateFile',
            filename: path.resolve(LOGS_PATH, './API_QUERY'),
            pattern: '_yyyy-MM-dd.log',
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category: 'log_date',
        },
    },
    categories: {
        default: { appenders: ['info'], level: 'info' },
        info: { appenders: ['info'], level: 'info' },
        err: { appenders: ['err'], level: 'error' },
        query: { appenders: ['query'], level: 'info' },
    },
});
const info = process.env.NODE_ENV === 'dev' ? console : log4js.getLogger('info');
const err = process.env.NODE_ENV === 'dev' ? console : log4js.getLogger('err');
const query = process.env.NODE_ENV === 'dev' ? console : log4js.getLogger('query');

const TIMEOUT = (response, msg) => {
    err.error(msg);
    response.json(DTO.TIMEOUT_ERR);
}

module.exports = {
    info,
    err,
    query,
    TIMEOUT
};