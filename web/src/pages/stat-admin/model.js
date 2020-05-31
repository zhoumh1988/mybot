import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {list, listWords, pageWords} from './service'
import moment from 'moment'

const ranges = {
    "昨天": [
        moment().subtract(1, 'day'), moment().subtract(1, 'day')
    ],
    '1周': [
        moment().subtract(7, 'days'), moment().subtract(1, 'day')
    ],
    '1个月': [
        moment().subtract(30, 'days'),
        moment().subtract(1, 'day')
    ]
};

export default modelExtend(model, {
    namespace: 'statAdmin',
    state: {
        pending: false,
        ranges: ranges,
        active: {
            data: [],
            list: []
        },
        word: {
            data: [],
            list: []
        }
    },
    subscriptions: {
        setup({dispatch, history}) {
            history.listen(({pathname}) => {
                if (pathname === '/stat-admin') {
                    dispatch({
                        type: 'query',
                        payload: {
                            daterange: ranges['1个月'].map(it => it.format('YYYY-MM-DD'))
                        }
                    })
                } else if(pathname === '/stat-admin/word') {
                    dispatch({
                        type: 'queryWord',
                        payload: {
                            daterange: ranges['1个月'].map(it => it.format('YYYY-MM-DD'))
                        }
                    })
                }
            })
        }
    },
    effects: {
        * query({
            payload
        }, {call, put}) {
            yield put({
                type: 'updateState',
                payload: {
                    // pending: true,
                    active: {
                        data: [],
                        list: []
                    }
                }
            });
            let daterange = payload.daterange;
            delete payload.daterange;
            payload.start = daterange[0];
            payload.end = daterange[1];
            const data = yield call(list, payload)
            if (data.code === 0) {
                // const list = yield call(page, payload)
                // if(list.code === 0) {
                    yield put({
                        type: 'updateState',
                        payload: {
                            // pending: false,
                            active: {
                                data: data.data,
                                // list: list.data.pageList
                            }
                        }
                    })
                // }
            } else {
                throw data
            }
        },

        * queryWord({
            payload
        }, {call, put}) {
            yield put({
                type: 'updateState',
                payload: {
                    // pending: true,
                    word: {
                        data: [],
                        list: []
                    }
                }
            });
            let daterange = payload.daterange;
            delete payload.daterange;
            payload.start = daterange[0];
            payload.end = daterange[1];
            const data = yield call(listWords, payload)
            if (data.code === 0) {
                const list = yield call(pageWords, payload)
                if(list.code === 0) {
                    yield put({
                        type: 'updateState',
                        payload: {
                            // pending: false,
                            word: {
                                data: data.data,
                                list: list.data
                            }
                        }
                    })
                } else {
                    throw data;
                }
            } else {
                throw data
            }
        }
    },
    reducers: {
    }
})
