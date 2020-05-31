import modelExtend from 'dva-model-extend'
import { model } from 'utils/model'
import { query } from './service'

export default modelExtend(model, {
    namespace: 'rooms',
    state: {
        loading: true,
        pageno: 0,
        pagesize: 15,
        pageList: [],
        total: 0
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({ pathname }) => {
                if (pathname === '/rooms') {
                    dispatch({
                        type: 'pageList',
                        payload: {
                            pageno: 0,
                            pagesize: 15
                        }
                    })
                }
            })
        }
    },
    effects: {
        * pageList({
            payload
        }, { call, put }) {
            yield put({
                type: 'queryPageList',
                payload: {
                    loading: true,
                    pageList: []
                }
            });
            const data = yield call(query, payload)
            if (data.code === 0) {
                yield put({
                    type: 'queryPageList',
                    payload: {
                        loading: false,
                        ...data.data
                    }
                })
            } else {
                throw data
            }
        }
    },
    reducers: {
        queryPageList(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        }
    }
})
