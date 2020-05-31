import { request, config } from 'utils'

const { api } = config
const { statTotal ,userActive,adminPie,totalPie,totalPieList,listRoom,userPieList,userPie} = api

export function query (params) {
  return request({
    url: statTotal,
    method: 'post',
    data: params,
  })
}
export function UserActive (params) {
    return request({
      url: userActive,
      method: 'post',
      data: params,
    })
  }
  export function AdminPie (params) {
    return request({
      url: adminPie,
      method: 'post',
      data: params,
    })
  }
  export function TotalPie (params) {
    return request({
      url: totalPie,
      method: 'post',
      data: params,
    })
  }
  export function TotalPieList (params) {
    return request({
      url: totalPieList,
      method: 'post',
      data: params,
    })
  }
  export function ListRoom (params) {
    return request({
      url: listRoom,
      method: 'get',
      data: params,
    })
  }
  export function UserPieList (params) {
    return request({
      url: userPieList,
      method: 'post',
      data: params,
    })
  }
  export function UserPie (params) {
    return request({
      url: userPie,
      method: 'post',
      data: params,
    })
  }