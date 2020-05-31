import {request, config} from 'utils'

const {APIV1} = config

export function list(params) {
    return request({url: `${APIV1}/stat/adminactive/line`, method: 'post', data: params})
}

export function page(params) {
    return request({url: `${APIV1}/stat/adminactive/page`, method: 'post', data: params})
}

export function listWords(params) {
    return request({url: `${APIV1}/stat/adminword/pie`, method: 'post', data: params})
}

export function pageWords(params) {
    return request({url: `${APIV1}/stat/adminword/list`, method: 'post', data: params})
}