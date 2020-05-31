import {request, config} from 'utils'

const {APIV1} = config

export function get() {
    return request.get(`${APIV1}/settings`)
}

export function update(params) {
    return request.post(`${APIV1}/settings`, params)
}

export default {
    get,
    update,
}