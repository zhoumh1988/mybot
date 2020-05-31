import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {pageList, del} from './service'
import {message} from 'antd'

function * page({
    payload
}, {call, put}) {
    const data = yield call(pageList, payload)
    if (data.code === 0) {
        yield put({
            type: 'updateState',
            payload: {
                loading: false,
                ...data.data
            }
        })
    } else {
        throw data
    }
}

export default modelExtend(model, {
    namespace: 'fouls',
    state: {
        loading: true,
        pageno: 0,
        pagesize: 15,
        pageList: [],
        total: 0
    },
    subscriptions: {
        setup({dispatch, history}) {
            history.listen(({pathname}) => {
                if (pathname === '/fouls') {
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
        }, {call, put}) {
            yield put({
                type: 'updateState',
                payload: {
                    loading: true,
                    pageList: []
                }
            });
            yield page({
                payload
            }, {call, put});
        },
        * del({
            payload
        }, {call, put}) {
            yield put({
                type: 'updateState',
                payload: {
                    loading: true
                }
            });
            const data = yield call(del, payload.id)
            if (data.code === 0) {
                message.success('操作成功！')
                yield page({
                    payload: {
                        pageno: 0,
                        pagesize: 15
                    }
                }, {call, put});
            } else {
                throw data;
            }
        }
    },
    reducers: {}
})
