const log4js = require('log4js');
const path = require('path')
const { LOGS_PATH } = require('../config');
log4js.configure({
    appenders: {
        info: {
            type: 'dateFile',
            filename: path.resolve(LOGS_PATH, './INFO'),
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category:"log_date"
        },
        err: {
            type: 'dateFile',
            filename: path.resolve(LOGS_PATH, './ERROR'),
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category:"log_date"
        },
        query: {
            type: 'dateFile',
            filename: path.resolve(LOGS_PATH, './QUERY'),
            pattern: "_yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category:"log_date"
        }
    },
    categories: {
        default: { appenders: ['info'], level: 'info' },
        info: {appenders: ['info'], level: 'info'},
        err: {appenders: ['err'], level: 'error'},
        query: {appenders: ['query'], level: 'info'}
    }
});
const info = log4js.getLogger('info');
const err = log4js.getLogger('err');
const query = log4js.getLogger('query');
module.exports = {
    info,
    err,
    query
};