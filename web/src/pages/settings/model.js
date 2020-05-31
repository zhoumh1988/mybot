import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {get, update} from './service'

const settingsModel = modelExtend(model, {
    namespace: 'settings',
    state: {},
    subscriptions: {
        setup({dispatch, history}) {
            history.listen(({pathname}) => {
                if (pathname === '/settings') {
                    dispatch({type: 'get'})
                }
            })
        }
    },
    effects: {
        * get({payload}, {call, put}) {
            if(!payload.loading) {
                yield put({
                    type: 'updateState',
                    payload: {
                        loading: true
                    }
                });
            }
            const res = yield call(get);
            if(res.code === 0) {
                yield put({
                    type: 'updateState',
                    payload: {
                        ...res.data
                    }
                })
            } else {
                throw res;
            }
        },
        * update({
            payload
        }, {call, put, ...other}) {
            yield put({
                type: 'updateState',
                payload: {
                    loading: true
                }
            });
            const res = yield call(update, payload);
            if(res.code === 0) {
                settingsModel.effects.get({payload: {loading: true}}, {call, put, ...other});
            } else {
                throw res;
            }
        }
    },
    reducers: {}
})

export default settingsModel