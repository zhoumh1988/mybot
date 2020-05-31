import {request, config} from 'utils'
import common from 'common'

const {APIV1} = config

export function pageList(params) {
    if(Array.isArray(params.daterange) && common.isNotEmpty(params.daterange)) {
        let daterange = params.daterange;
        delete params.daterange;
        params.start = daterange[0];
        params.end = daterange[1];
    }
    return request({url: `${APIV1}/fouls/page`, method: 'post', data: params})
}

export function del(params) {
    return request({url: `${APIV1}/fouls/revoke`, method: 'post', data: params})
}

export function bakRecord(params) {
    return request({url: `${APIV1}/fouls/bak`, method: 'post', data: params})
}

export default {
    del,
    pageList,
    bakRecord
}