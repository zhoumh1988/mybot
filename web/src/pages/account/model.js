import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {query, retPwd, delUser, modifyStat} from './service'
import {Message} from 'antd'

const Model = modelExtend(model, {
    namespace: 'userList',
    state: {
        loading: true,
        pageno: 0,
        pagesize: 15,
        pageList: [],
        total: 0,
        status: 0,
        name: ''
    },
    subscriptions: {
        setup({dispatch, history}) {
            history.listen(({pathname}) => {
                if (pathname === '/account') {
                    dispatch({
                        type: 'querys',
                        payload: {
                            status: 0,
                            pageno: 0,
                            pagesize: 15
                        }
                    })
                }
            })
        }
    },
    effects: {
        * querys({
            payload
        }, {call, put}) {
            yield put({
                type: 'updateState',
                payload: {
                    loading: true,
                }
            });
            const data = yield call(query, payload)
            if (data.code === 0) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        loading: false,
                        ...data.data,
                        ...payload
                    }
                })
            } else {
                throw data
            }
        },
        * retPwd({
            payload
        }, {call}) {
            const data = yield call(retPwd, payload);
            if (data.code === 0) {
                Message.success('重置密码成功')
            } else {
                throw data;
            }
        },
        * del({
            payload
        }, {call, put, select}) {
            const data = yield call(delUser, payload);
            if (data.code === 0) {
                const {
                    status = 0,
                    name
                } = yield select((state) => state.userList);
                yield call(Model.effects.querys, {
                    payload: {
                        pageno: 0,
                        pagesize: 15,
                        status,
                        name
                    }
                }, {call, put});
                Message.success('注销成功')
            } else {
                throw data;
            }
        },
        * modifyStat({
            payload
        }, {call, put, select}) {
            const data = yield call(modifyStat, payload);
            if (data.code === 0) {
                const {
                    pageno,
                    pagesize,
                    status = 0,
                    name
                } = yield select((state) => state.userList);
                yield call(Model.effects.querys, {
                    payload: {
                        pageno,
                        pagesize,
                        status,
                        name
                    }
                }, {call, put});
                Message.success('修改成功')
            } else {
                throw data;
            }
        }
    },
    reducers: {
        querySuccess(state, {payload}) {
            return {
                ...state,
                ...payload
            }
        }
    }
})

export default Model;
