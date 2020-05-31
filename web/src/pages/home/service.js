import { request, config } from 'utils'

const { api } = config
const { homeStat,statTotal,keywordsList,keywordsColumnar,smallIndex } = api

export function query (params) {
  return request({
    url: homeStat,
    method: 'post',
    data: params,
  })
}
export function StatTotal (params) {
    return request({
      url: statTotal,
      method: 'post',
      data: params,
    })
  }
  export function KeywordsList (params) {
    return request({
      url: keywordsList,
      method: 'post',
      data: params,
    })
  }
  export function KeywordsColumnar (params) {
    return request({
      url: keywordsColumnar,
      method: 'post',
      data: params,
    })
  }
  export function SmallIndex (params) {
    return request({
      url: smallIndex,
      method: 'get',
      data: params,
    })
  }