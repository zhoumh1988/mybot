const fs = require('fs');

module.exports = (app) => {
    const dir = fs.readdirSync(__dirname);
    dir.forEach(ele => {
        if(ele.indexOf('Service') !== -1) {
            const serviceName = ele.split('.')[0];
            const service = require(`./${serviceName}`);
            service.call(null, app);
        }
    });
}