import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {query, StatTotal, KeywordsList, KeywordsColumnar} from './service'
import moment from 'moment';

const start = moment()
    .subtract(30, 'days')
    .format("YYYY-MM-DD")
const end = moment()
    .subtract(1, 'days')
    .format("YYYY-MM-DD")
export default modelExtend(model, {
    namespace: 'home',
    state: {
        data: '',
        SmallIndex: null,
        pageList: [],
        keyword: [],
        keywordsColumnar: []
    },
    subscriptions: {
        setup({dispatch, history}) {
            history.listen(({pathname}) => {
                if (pathname === '/home') {
                    dispatch({type: 'querys', payload: {}})
                    dispatch({
                        type: 'querysTotal',
                        payload: {
                            start: start,
                            end: end
                        }
                    })
                    dispatch({
                        type: 'querysKeywords',
                        payload: {
                            start: start,
                            end: end
                        }
                    })
                    dispatch({type: 'querysKeywordsColumnar', payload: {}})
                }
            })
        }
    },
    effects: {
        * querys({
            payload
        }, {call, put}) {
            const data = yield call(query, payload)
            // const datas = yield call(SmallIndex, {}) console.log(datas)
            if (data.code === 0) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        data: data.data
                    }
                })
            } else {
                throw data
            }
        },
        * querysTotal({
            payload
        }, {call, put}) {
            const data = yield call(StatTotal, payload)
            if (data.code === 0) {
                yield put({
                    type: 'activeSuccess',
                    payload: {
                        ...data
                    }
                })
            } else {
                throw data
            }
        },
        * querysKeywords({
            payload
        }, {call, put}) {
            const data = yield call(KeywordsList, payload)
            if (data.code === 0) {
                yield put({
                    type: 'KeywordSuccess',
                    payload: {
                        ...data
                    }
                })
            } else {
                throw data
            }
        },
        * querysKeywordsColumnar({
            payload
        }, {call, put}) {
            const data = yield call(KeywordsColumnar, payload)
            if (data.code === 0) {
                yield put({
                    type: 'KeywordsColumnarSuccess',
                    payload: {
                        ...data
                    }
                })
            } else {
                throw data
            }
        }
    },
    reducers: {
        querySuccess(state, {payload}) {
            return {
                ...state,
                ...payload
            }
        },
        activeSuccess(state, {payload}) {
            return {
                ...state,
                pageList: payload.data
            }
        },
        KeywordSuccess(state, {payload}) {
            return {
                ...state,
                keyword: payload.data
            }
        },
        KeywordsColumnarSuccess(state, {payload}) {
            return {
                ...state,
                keywordsColumnar: payload.data
            }
        }
    }
})
