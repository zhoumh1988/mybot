const superagent = require('superagent');
const cheerio = require('cheerio');
const {
    info,
    err
} = require('./Log');
const redis = require('redis');
const {
    REDIS_CONFIG,
    REPTILE_LIGHTCHAIN
} = require('../config');
const {
    isNotEmpty,
    moment
} = require('./Utils');

// 爬虫链接
const URLS = {
    "top100": "https://www.feixiaohao.com/",
    "up_hour": "https://api.feixiaohao.com/vol/maxchange/?datatype=up&timetype=1&searchtype=1",
    "up_day": "https://api.feixiaohao.com/vol/maxchange/?datatype=up&timetype=2&searchtype=1",
    "up_week": "https://api.feixiaohao.com/vol/maxchange/?datatype=up&timetype=3&searchtype=1",
    "down_hour": "https://api.feixiaohao.com/vol/maxchange/?datatype=down&timetype=1&searchtype=1",
    "down_day": "https://api.feixiaohao.com/vol/maxchange/?datatype=down&timetype=2&searchtype=1",
    "down_week": "https://api.feixiaohao.com/vol/maxchange/?datatype=down&timetype=3&searchtype=1",
    "LightChain": "https://www.feixiaohao.com/currencies/lightchain/",
    "coin_price_native": "https://www.feixiaohao.com/currencies/lightchain/#native",
    "coin_price_CNY": "https://www.feixiaohao.com/currencies/lightchain/#CNY",
    "coin_price_USD": "https://www.feixiaohao.com/currencies/lightchain/#USD",
    "coin_price_BTC": "https://www.feixiaohao.com/currencies/lightchain/#BTC"
};

const top100 = ($) => {
    let list = [];
    let keys = [];
    $('#table tr').each((idx, tr) => {
        if (idx == 0) {
            $(tr).find('th').each((i, th) => i < 7 && keys.push($(th).text()));
        } else {
            let record = {};
            keys.forEach((key, i) => record[key] = $(tr).find('td').eq(i).text())
            list.push(record);
        }
    });
    return {
        keys,
        list
    };
}

const maxchange = ($) => {
    let list = [];
    let keys = [];
    $('.table-rank tr').each((idx, tr) => {
        if (idx == 0) {
            $(tr).find('th').each((i, th) => keys.push($(th).text()));
        } else {
            let record = {};
            keys.forEach((key, i) => record[key] = $(tr).find('td').eq(i).text())
            list.push(record);
        }
    });
    return {
        keys,
        list
    };
}

const lightchain = ($) => {
    let record = {
        tit: 'LIGHT / 光链'
    };
    const part = $('.firstPart');
    record.rank = part.find('.tag-vol').text();
    part.find('.tag-vol').replaceWith('');
    record.cell = [];
    part.find('.cell').each((idx, el) => {
        let cell = {};
        if (idx == 0) {
            cell.trend = $(el).find('.coinprice').find('span').text();
            cell.trend_tag = $(el).find('.coinprice').find('span').attr('class');
            $(el).find('.coinprice').find('span').replaceWith('');

            cell.coinprice = $(el).find('.coinprice').text();
            cell.coinprice_usd = $(el).find('.sub span').eq(0).text();
            cell.coinprice_btc = $(el).find('.sub span').eq(1).text();
        } else if (idx == 2) {
            $(el).find('.tit').each((i, it) => {
                cell[$(it).text()] = $(el).find('.value').eq(i).text();
            });
        } else {
            let key = $(el).find('.tit').text();
            cell[key] = {
                rmb: $(el).find('.value').text(),
                usd: $(el).find('.sub').eq(0).text(),
                btc: $(el).find('.sub').eq(1).text()
            }
        }
        record.cell.push(cell);
    });
    return record;
}

function formatprice(val) {
    var price = val.toString();
    var indx = price.indexOf('.');
    var priceStr = price;
    var counter = 0;
    if (indx > -1) {
        for (var i = price.length - 1; i >= 1; i--) {
            if (price[i] == "0") {
                counter++;
                if (price[i - 1] == ".") {
                    counter++;
                    break;
                }
            } else {
                break;
            }
        }
        priceStr = "";
        for (var i = 0; i < price.length - counter; i++) {
            priceStr += price[i];
        }
    }
    return priceStr;
}


function format_crypto(val) {
    var result;
    if (val >= 1000) {
        result = toLocaleString(val, 2);
    } else if (val >= 1) {
        result = val.toFixed(2);
    } else {
        if (val > 0.01) {
            result = val.toPrecision(4)
        } else {
            result = val.toFixed(8);
        }
    }
    return result;
}

function format_crypto_volume(val) {
    if (val >= 1000000) {
        val = Math.round(val / 10000).toLocaleString() + "万";
    } else if (val >= 100000) {
        val = (val / 10000).toLocaleString() + "万";
    } else if (val >= 1000) {
        val = (val / 10000).toFixed(2).toLocaleString() + "万";
    } else if (val >= 100) {
        val = val.toFixed(0).toLocaleString();
    } else if (val >= 0.1) {
        val = val.toFixed(2).toLocaleString();
    } else {
        val = val.toFixed(4).toLocaleString();
    }
    return formatprice(val);
}

const currencies = ($) => {
    let list = [];
    let keys = [];
    $('#markets tr').each((idx, tr) => {
        if (idx == 0) {
            $(tr).find('th').each((i, th) => i < 7 && keys.push($(th).text()));
        } else {
            let record = {};
            keys.forEach((key, i) => isNotEmpty($(tr).find('td').eq(i).text()) && (record[key] = $(tr).find('td').eq(i).text().trim()))
            isNotEmpty(record) && list.push(record);
        }
    });
    return {
        keys,
        list
    };
}

const Reptile = (key, url) => {
    return new Promise((resolve, reject) => {
        superagent.get(url).end((err, response) => {
            if(err) {
                reject(err);
            } else {
                let $ = cheerio.load(response.text);
                let value = "";
                let prifix = '';
                let attrName = '';
                switch(key) {
                    case "coin_price_native":
                        prifix = '';
                        attrName = 'native';
                        break;
                    case "coin_price_CNY":
                        prifix = '¥';
                        attrName = 'cny';
                        break;
                    case "coin_price_USD":
                        prifix = '$';
                        attrName = 'usd';
                        break;
                    case "coin_price_BTC":
                        prifix = 'BTC';
                        attrName = 'btc';
                        break;
                    default: 
    
                }
                switch (key) {
                    case "top100":
                        value = top100($);
                        break;
                    case "up_hour":
                    case "up_day":
                    case "up_week":
                    case "down_hour":
                    case "down_day":
                    case "down_week":
                        value = maxchange($);
                        break;
                    case "LightChain":
                        value = lightchain($);
                        break;
                    case "coin_price_native":
                    case "coin_price_CNY":
                    case "coin_price_USD":
                    case "coin_price_BTC":
                        $('.price, .volume').each((idx, el) => {
                            let amount = $(el).attr("data-" + attrName);
                            if (amount != "?") {
                                let clsName = $(el).attr('class');
                                amount = parseFloat(amount)
                                if(clsName == 'price') {
                                    amount = format_crypto(amount);
                                } else {
                                    amount = format_crypto_volume(amount);
                                }
                                $(el).html(prifix + amount)
                            } else {
                                $(el).html(amount)
                            }
                        });
                        value = currencies($);
                        break;
                    default:
                        value = url;
                }
                resolve([key, value]);
            }
        });
    });
}

// 开始爬虫
const start = () => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    info.info(`开始爬取数据${timestamp}`);
    const client = redis.createClient(REDIS_CONFIG.PORT, REDIS_CONFIG.HOST);
    const promises = [];
    for (let key in URLS) {
        promises.push(Reptile(key, URLS[key]));
    }
    Promise
        .all(promises)
        .then(res => {
            const result = {
                timestamp
            };
            res.map(it => result[it[0]] = it[1]);
            client.set(REPTILE_LIGHTCHAIN, JSON.stringify(result));
        })
        .catch(error => err.error(error))
        .finally(() => {
            // client.get(REPTILE_LIGHTCHAIN, (err, value) => {
            //     console.log(value);
            // });
            client.quit();
            info.info('结束爬取数据');
        });
}

module.exports = {
    start
}

// start();