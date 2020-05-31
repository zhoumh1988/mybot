import {request, config} from 'utils'
import common from 'common'

const {APIV1} = config

export function model(params) {
    if(Array.isArray(params.daterange) && common.isNotEmpty(params.daterange)) {
        let daterange = params.daterange;
        delete params.daterange;
        params.start = daterange[0];
        params.end = daterange[1];
    }
    return request({url: `${APIV1}/chats/mode`, method: 'post', data: params})
}

export function listRoom() {
    return request({url: `${APIV1}/room/listRoom`, method: 'get'})
}

export function listContact(roomid) {
    return request({url: `${APIV1}/contact/listContact?roomid=${roomid}`, method: 'get'})
}

export function exportChats(params) {
    if(Array.isArray(params.daterange) && common.isNotEmpty(params.daterange)) {
        let daterange = params.daterange;
        delete params.daterange;
        params.start = daterange[0];
        params.end = daterange[1];
    }
    return request({url: `${APIV1}/chats/export`, method: 'post', data: params})
}