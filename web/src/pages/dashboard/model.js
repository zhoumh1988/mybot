import modelExtend from 'dva-model-extend'
import { model } from 'utils/model'
import { query, TotalPie, TotalPieList, UserActive, ListRoom, UserPieList, UserPie } from './service'
import moment from 'moment';

const start = moment().subtract(30, 'days').format("YYYY-MM-DD");
const end = moment().subtract(1, 'days').format("YYYY-MM-DD")
// let roomid = '';
export default modelExtend(model, {
    namespace: 'dashboard',
    state: {
        pageList: [],
        pieList: [],
        pieListTable: [],
        listRoom: [],
        userActiveList: [],
        roomid: '',
        userPie: [],
        userPieList: []
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({ pathname }) => {
                switch (pathname) {
                    case "/dashboard/totalLine":
                        dispatch({
                            type: 'querysTotal',
                            payload: {
                                start: start,
                                end: end
                            }
                        })
                        break;
                    case "/dashboard/userLine":
                        dispatch({
                            type: 'roomList',
                            payload: {
                            }
                        })
                        break;
                    case "/dashboard/totalWord":
                        dispatch({
                            type: 'querysPie',
                            payload: {
                                start: start,
                                end: end
                            }
                        })
                        dispatch({
                            type: 'querysPieList',
                            payload: {
                                start: start,
                                end: end
                            }
                        })
                        break;
                    case "/dashboard/userWord":
                        dispatch({
                            type: 'userWordPie',
                            payload: {
                                start: start,
                                end: end
                            }
                        })
                        // dispatch({
                        //     type: 'userWordPieList',
                        //     payload: {
                        //         start: start,
                        //         end: end
                        //     }
                        // })
                        break;
                    default:
                        break;

                }
            })
        },
    },
    effects: {
        * querysTotal({
            payload,
        }, { call, put }) {
            const data = yield call(query, payload)
            if (data.code === 0) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        // loading: false,
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
            const data = yield call(TotalPie, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesPie',
                    payload: {
                        loading: false,
                        ...data
                    }
                })
            } else {
                throw data
            }
        },
        * querysPieList({
            payload,
        }, { call, put }) {
            const data = yield call(TotalPieList, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesPieList',
                    payload: {
                        loading: false,
                        ...data
                    }
                })
            } else {
                throw data
            }
        },
        * roomList({
            payload,
        }, { call, put }) {
            const data = yield call(ListRoom, payload)
                payload.roomid=data.data[0].id
                payload= {
                            start: start,
                            end: end,
                            roomid: data.data[0].id
                        }
                const _data = yield call(UserActive, payload)
                if (_data.code === 0) {
                    yield put({
                        type: 'SuccesListRoom',
                        payload: {
                            ...data,
                            _data
                        }
                    })
                } else {
                    throw data
                }
        },
        * querysuserLine({
            payload,
        }, { call, put }) {
            const data = yield call(UserActive, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesUserActive',
                    payload: {
                        ...data
                    }
                })
            } else {
                throw data
            }
        }, * userWordPie({
            payload,
        }, { call, put }) {
            const datas = yield call(ListRoom, {})
                payload.roomid=datas.data[0].id
            const data = yield call(UserPie, payload)
            const res = yield call(UserPieList, payload)
            if (res.code === 0) {
                yield put({
                    type: 'SuccesUserPie',
                    payload: {
                        loading: false,
                        datas,
                        res,
                        ...data,
                    }
                })
            } else {
                throw data
            }
        },
        * userWordPieList({
            payload,
        }, { call, put }) {
            const res = yield call(UserPie, payload)
            const data = yield call(UserPieList, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesUserPieList',
                    payload: {
                        loading: false,
                        ...data,
                        res
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
        SuccesPie(state, { payload }) {
            return {
                ...state,
                pieList: payload.data,
                ...payload,
            }
        },
        SuccesPieList(state, { payload }) {
            return {
                ...state,
                pieListTable: payload.data,
            }
        },
        SuccesListRoom(state, { payload }) {
            payload.roomid = payload.data[0].id
            return {
                ...state,
                listRoom: payload.data,
                roomid: payload.data[0].id,
                userActiveList:payload._data.data
            }
        },
        SuccesUserActive(state, { payload }) {
            return {
                ...state,
                userActiveList: payload.data,
            }
        },
        SuccesUserPie(state, { payload }) {
            let listRoom=state.listRoom.length?state.listRoom:payload.datas.data
            return {
                ...state,
                userPie: payload.data,
                userPieList:payload.res.data,
                listRoom,
            }
        },
        SuccesUserPieList(state, { payload }) {
            return {
                ...state,
                userPieList: payload.data,
                userPie:payload.res.data
            }
        },

    },
})
