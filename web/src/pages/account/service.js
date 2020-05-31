import { request, config } from 'utils'

const { api } = config
const { accountList ,itemUnique,resetPwd,deleteUser,createUser,userInfo,modifyMobile,modifyEmail,modifyPwd, modifyStatus} = api

export function query (params) {
  return request({
    url: accountList,
    method: 'post',
    data: params,
  })
}
export function retPwd (params) {
  return request({
    url: resetPwd.replace(':id',params.id),
    method: 'get',
    data: params,
  })
}
export function delUser (params) {
  return request({
    url: deleteUser.replace(':id',params.id),
    method: 'get',
    data: params,
  })
}
export function addUser (params) {
  return request({
    url: createUser,
    method: 'post',
    data: params,
  })
}
export function getInfo (params) {
  return request({
    url: userInfo,
    method: 'get',
    data: params,
  })
}
export function changePwd (params) {
  return request({
    url: modifyPwd,
    method: 'post',
    data: params,
  })
}
export function modifyEmails (params) {
  return request({
    url: modifyEmail,
    method: 'post',
    data: params,
  })
}
export function modifyMobiles (params) {
  return request({
    url: modifyMobile,
    method: 'post',
    data: params,
  })
}
export function uniques(params,prop) {
  return request({url: itemUnique.replace(':prop',prop), method: 'post', data: params})
}

export function modifyStat(record) {
  return request({url: modifyStatus, method: 'post', data: record})
}
