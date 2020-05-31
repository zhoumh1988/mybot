import { request, config } from 'utils'

const { api } = config
const { roomActive, listRoom, userPie, roomPie} = api

export function query (params) {
  return request({
    url: roomActive,
    method: 'post',
    data: params,
  })
}
export function RoomPage() {
    return request({
        url: listRoom,
        method: 'get',
    })
}
export function TotalPie (params) {
    return request({
      url: userPie,
      method: 'post',
      data: params,
    })
}
export function TotalPieList (params) {
    return request({
      url: roomPie,
      method: 'post',
      data: params,
    })
}
