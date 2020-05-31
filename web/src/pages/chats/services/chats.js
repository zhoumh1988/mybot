import {request, config} from 'utils'
import common from '../../../common'

const {APIV1} = config

export function pageList(params) {
    if(Array.isArray(params.daterange) && common.isNotEmpty(params.daterange)) {
        let daterange = params.daterange;
        delete params.daterange;
        params.start = daterange[0];
        params.end = daterange[1];
    }
    return request({url: `${APIV1}/chats/page`, method: 'post', data: params})
}

export function bakRecord(params) { 
    return request({url: `${APIV1}/chats/bak`, method: 'post', data: params})
}

export function reply(params) { 
    return request({url: `${APIV1}/common/reply`, method: 'post', data: params})
}

export function exportChats(params) {
    if(Array.isArray(params.daterange) && common.isNotEmpty(params.daterange)) {
        let daterange = params.daterange;
        delete params.daterange;
        params.start = daterange[0];
        params.end = daterange[1];
    }

    if(common.isNotEmpty(params.role)) {
        params.roles = [params.role];
    }
    return request({url: `${APIV1}/chats/export`, method: 'post', data: params})
}
