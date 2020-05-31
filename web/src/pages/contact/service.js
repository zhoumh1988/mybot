import { request, config } from 'utils'

const { api } = config
const { contactPage, setRole} = api

export function query(params) {
  return request({
    url: contactPage,
    method: 'post',
    data: params,
  })
}
export function setRoles(params) {
  return request({
    url: setRole,
    method: 'post',
    data: params,
  })
}
