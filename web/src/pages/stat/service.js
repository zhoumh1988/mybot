import { request, config } from 'utils'

const { api } = config
const { userInfoPie, chatsLine} = api

export function UserInfoPie (params) {
    return request({
        url: userInfoPie,
        method: 'post',
        data: params,
    })
}

export function ChatsLine (params) {
    return request({
        url: chatsLine,
        method: 'post',
        data: params,
    })
}

