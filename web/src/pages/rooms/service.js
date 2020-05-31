import { request, config } from 'utils'

const { api } = config
const { roomPage, contactList, userList, roomManage, roomOwer, pushMessage } = api

export function query(params) {
  return request({
    url: roomPage,
    method: 'post',
    data: params,
  })
}
export function queryManage(params) {
  return request({
    url: contactList,
    method: 'get',
    data: params,
  })
}
export function queryOwer(params) {
  return request({
    url: userList,
    method: 'get',
    data: params,
  })
}
export function setManage(params) {
  return request({
    url: roomManage,
    method: 'post',
    data: params,
  })
}
export function setOwer(params) {
  return request({
    url: roomOwer,
    method: 'post',
    data: params,
  })
}
export function setPushMessage(params) {
  return request({
    url: pushMessage,
    method: 'post',
    data: params,
  })
}

