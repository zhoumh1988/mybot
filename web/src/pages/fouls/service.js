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
    return request({url: `${APIV1}/keywords/foul/page`, method: 'post', data: params})
}

export function update(params) {
    return request({url: `${APIV1}/keywords/update`, method: 'post', data: params})
}
/**
 * 
 */
export function add(params) {
    return request({url: `${APIV1}/keywords/foul/create`, method: 'post', data: params})
}

export function del(id) {
    return request({url: `${APIV1}/keywords/delete/${id}`, method: 'get'})
}

export function unique(params) {
    return request({url: `${APIV1}/keywords/unique`, method: 'post', data: params})
}

export default {
    add,
    update,
    del,
    pageList,
    unique
}