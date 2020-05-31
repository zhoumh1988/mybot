import {request, config} from 'utils'

const {APIV1} = config

export function reply(params) {
    return request({url: `${APIV1}/common/reply`, method: 'post', data: params})
}

export function replyChat(params) {
    return request({url: `${APIV1}/common/reply/chat`, method: 'post', data: params})
}
