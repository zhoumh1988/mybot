import modelExtend from 'dva-model-extend'
import { model } from 'utils/model'
import { query, setRoles } from './service'
import {Message} from 'antd'

const Model = modelExtend(model, {
    namespace: 'contact',
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
                if (pathname === '/contact') {
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
                    ...payload
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
        },
        * setRole({
            payload
        }, {call, put, select}) {
            const data = yield call(setRoles, payload)
            if(data.code === 0) {
                if (data.data > 0) {
                    Message.success('设置成功');
                    const payload = yield select(state => state.contact);
                    yield call(Model.effects.pageList, {payload: payload}, {call, put, select});
                }
            } else {
                throw data;
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
export default Model;