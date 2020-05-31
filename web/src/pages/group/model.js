import modelExtend from 'dva-model-extend'
import { model } from 'utils/model'
import { query, RoomPage, TotalPieList, TotalPie } from './service'
import moment from 'moment';

const start = moment().subtract(30, 'days').format("YYYY-MM-DD")
const end = moment().subtract(1, 'days').format("YYYY-MM-DD")

export default modelExtend(model, {
    namespace: 'group',
    state: {
        pie: [],
        pieList:[],
        pageList:[]
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({ pathname }) => {
                switch (pathname) {
                    case "/group" : 
                        dispatch({
                            type: 'querys',
                            payload: {
                                start: start,
                                end: end
                            }
                        })
                        break;
                    case "/group/word" : 
                        dispatch({
                            type: 'querysPie',
                            payload: {
                                start: start,
                                end: end
                            }
                        })
                        break;
                    default:
                        break;
                }
            })
        },
    },
    effects: {
        * querys({
            payload,
        }, { call, put }) {
            if(!payload.roomid){
                const data_ = yield call(RoomPage, payload)
                if(data_.code === 0){
                    payload.roomid = data_.data[0].id
                }
            }
            const data = yield call(query, payload)
            if (data.code === 0) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        loading: false,
                        ...data
                    }
                })
            } else {
                throw data
            }
        },
        * querysPie({
            payload,
        }, { call, put }) {
            const data_ = yield call(RoomPage, payload)
            if(data_.code === 0){
                payload.roomid = data_.data[0].id
            }
            const data = yield call(TotalPie, payload)
            const dataList = yield call(TotalPieList, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesPie',
                    payload: {
                        pending: true,
                        ...data,
                        dataList
                    }
                })
            } else {
                throw data
            }
        }, 
        * querysPieList({
            payload,
        }, { call, put }) {
            const data = yield call(TotalPie, payload)
            const dataList = yield call(TotalPieList, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesPieList',
                    payload: {
                        pending: true,
                        ...data,
                        dataList
                    }
                })
            } else {
                throw data
            }
        },  
    },
    reducers: {
        querySuccess(state, { payload }) {
            return {
                ...state,
                pageList: payload.data,
                ...payload,
            }
        },
        SuccesPie(state, {payload}){
            return {
                ...state,
                pie: payload.data,
                roomList: payload.roomList,
                pieList: payload.dataList.data,
            }
        },
        SuccesPieList(state, {payload}){
            return {
                ...state,
                pie: payload.data,
                pieList: payload.dataList.data,
            }
        }
    },
})
