import React from 'react'
import {connect} from 'dva'
import {Table, Popover, Card, Divider} from 'antd'
import PropTypes from 'prop-types'
import {Page, Empty, SearchItems} from 'components'
import common from 'common'
import BakModal from './BakModal'
import DelBakModal from './delBakModal'
import { config } from 'utils'

const { api } = config
const { listRoom } = api

class IllegalUser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            searchItems: [
                {
                    key: 'contactName',
                    tag: 'input',
                    label: '用户名',
                    placeholder: '用户名'
                }, {
                    key: 'roomid',
                    tag: 'select',
                    label: '群组',
                    ajaxOption: {
                        url: listRoom
                    }
                }
            ],
            pagination: {
                pageno: 0,
                pagesize: 15
            },
            theadFilters: {},
            filters: {},
            visible: false,
            delVisible: false,
            ...props
        }
    }

    handleTableChange = (pagination, theadFilters) => {
        let filterItems = {}
        if (common.isNotEmpty(theadFilters)) {
            for(let prop in theadFilters) {
                if(typeof prop === 'string' && common.isNotEmpty(theadFilters[prop])) {
                    filterItems[prop] = parseInt(theadFilters[prop][0], 10);
                }
            }
        }
        this.setState({
            theadFilters: filterItems,
            pagination: common.handlePageParams(pagination)
        }, () => {
            this.fetch();
        });
    }

    onSubmit(filters) {
        let _filters = {
            ...filters
        }
        this.setState({
            filters: _filters,
            pagination: {
                pageno: 0,
                pagesize: 15
            }
        }, () => {
            this.fetch();
        })
    }

    onClear() {
        this.setState({
            filters: {}
        }, () => {
            this.fetch();
        })
    }

    fetch() {
        let {pagination, theadFilters, filters} = this.state;
        let params = {
            ...pagination,
            ...theadFilters,
            ...filters
        }
        this
            .props
            .dispatch({type: 'illegalUser/pageList', payload: params})
    }

    onDelete(record) {
        this.setState({delVisible: true, record: record})
    }

    showModal(record) {
        this.setState({visible: true, record: record})
    }

    closeModal(refresh) {
        this.setState({visible: false, record: {}})
        if(refresh) this.fetch()
    }
    
    showDelModal(record) {
        this.setState({delVisible: true, record: record})
    }

    closeDelModal(refresh) {
        this.setState({delVisible: false, record: {}})
        if(refresh) this.fetch()
    }

    render = () => {
        let {loading} = this.props.illegalUser;
        const scrollHeight = common.getScrollHeight();

        /** 表头 */
        const columns = [
            {
                title: '群组',
                dataIndex: 'topic',
                key: 'topic',
                width: 140
            }, {
                title: '用户名',
                dataIndex: 'contactName',
                key: 'contactName',
                width: 240
            }, {
                title: '内容',
                key: 'content',
                align: 'left',
                render: (text, record) => {
                    if (record.content) {
                        return record.content.length < 28 ? (<span>{record.content}</span>) : (
                        <Popover
                            placement="bottom"
                            content={record.content}>
                            <a>{`${record.content.substring(0, 25)}...`}</a>
                        </Popover>
                    )
                    } else if (record.type === 5) {
                        return (
                            <Popover
                                placement="right"
                                content={< img alt = "大图" src = {
                                    record.imgBase64
                            }
                            style = {{maxHeight: '60vh', maxWidth: '60vw'}}/>}>
                            <img
                            alt="缩略图"
                            src={record.imgBase64}
                            style={{
                                width: '20px',
                                    height: '20px',
                                    cursor: 'pointer'
                            }}/>
                            </Popover>
                        )
                    }
                }
            }, {
                title: '敏感词',
                dataIndex: 'keyword',
                key: 'keyword',
                width: 200
            }, {
                title: '操作',
                dataIndex: 'id',
                width: 120,
                align: 'center',
                render: (text, record) => {
                    return (
                        common.isEmpty(record.bak) ? (<div>
                                <a onClick={() => this.showModal.call(this, record)}>备注</a>
                                <Divider type="vertical" />
                                <a onClick={() => this.onDelete.call(this, record)}>删除</a></div>) : (
                            <div>
                                <Popover title="备注" placement="topLeft" content={<div style={{maxWidth: '400px'}}>{record.bak}</div>}>
                                    <a onClick={() => this.showModal.call(this, record)}>已备注</a>
                                </Popover>
                                <Divider type="vertical" />
                                <a onClick={() => this.onDelete.call(this, record)}>删除</a>
                            </div>
                        )
                    );
                }
            }
        ];

        return (
            <Page>
                <Card className="content-box"
                    title="违规管理"
                    extra={(<SearchItems
                        params={this.state.searchItems}
                        addVisible={false}
                        onClear={() => this.onClear.call(this)}
                        onSubmit={(filters) => this.onSubmit.call(this, filters)} />)}>
                    <Table
                        className="table-striped"
                        size="small"
                        locale={{emptyText: (<Empty style={{height: scrollHeight}} />)}}
                        columns={columns}
                        rowKey={record => record.id}
                        dataSource={this.props.illegalUser.pageList}
                        pagination={{
                        current: this.props.illegalUser.pageno + 1,
                        pageSize: this.props.illegalUser.pagesize,
                        ...this.props.illegalUser
                    }}
                        scroll={{
                        y: scrollHeight
                    }}
                        loading={loading}
                        onChange={(pagination, filters) => this.handleTableChange(pagination, filters)}/>
                </Card>
                {this.state.visible && <BakModal
                    record={this.state.record}
                    visible={this.state.visible}
                    handleCancel={() => this.closeModal.call(this, false)}
                    handleOk={() => this.closeModal.call(this, true)}/>}
                    
                {this.state.delVisible && <DelBakModal
                    record={this.state.record}
                    visible={this.state.delVisible}
                    handleDelCancel={() => this.closeDelModal.call(this, false)}
                    handleDelOk={() => this.closeDelModal.call(this, true)}/>}
            </Page>
        )
    }
}

IllegalUser.propTypes = {
    illegalUser: PropTypes.object
}

// export default illegalUser
export default connect(({illegalUser}) => ({illegalUser}))(IllegalUser)