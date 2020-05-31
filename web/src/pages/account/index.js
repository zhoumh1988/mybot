import React from 'react'
import {connect} from 'dva'
import {Table, Divider, Popconfirm, Card} from 'antd'
import PropTypes from 'prop-types'
import {Page, Empty, SearchItems} from 'components'
import common from 'common'
import Adduser from './addUser'

class Products extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {
                pageno: 0,
                pagesize: 15
            },
            filters: {
                status: 0
            },
            visible: false,
            confirmLoading: false,
            searchItems: [
                {
                    key: 'name',
                    tag: 'input',
                    label: 'name',
                    placeholder: '账户名称'
                }, {
                    key: 'mobile',
                    tag: 'input',
                    label: 'mobile',
                    placeholder: '手机号码'
                }, {
                    key: 'email',
                    tag: 'input',
                    label: 'email',
                    placeholder: '邮箱'
                }
            ],
            ...props
        }
    }

    showModal = () => {
        this.setState({visible: true})
    }

    resetAccount = (record) => {
        this
            .props
            .dispatch({
                type: 'userList/modifyStat',
                payload: {
                    id: record.id,
                    status: record.status === 0
                        ? 1
                        : 0
                }
            })
    }

    onDelete(id) {
        this
            .props
            .dispatch({
                type: 'userList/del',
                payload: {
                    id: id
                }
            })
    }
    resetPwd(id) {
        this
            .props
            .dispatch({type: 'userList/retPwd', payload: {
                    id
                }})
    }
    tableChange(pagination, filters) {
        let filterItems = {
            ...this.state.filters,
        }
        if (common.isNotEmpty(filters)) {
            for (let prop in filters) {
                if (typeof prop === 'string' && common.isNotEmpty(filters[prop])) {
                    filterItems[prop] = parseInt(filters[prop][0], 10) || filters[prop][0];
                }
            }
        }
        this.setState({
            pagination: common.handlePageParams(pagination),
            filters: filterItems
        }, () => {
            this.changeSelect();
        });
    }
    changeSelect() {
        let {pagination, filters} = this.state;
        let params = {
            ...pagination,
            ...filters
        }
        this
            .props
            .dispatch({type: 'userList/querys', payload: params})
    }
    handleCancel = (change) => {
        this.setState({visible: false})
        if (change) 
            this.changeSelect()
    }
    onSubmit = (filters) => {
        let _filters = {
            ...this.state.filters,
            ...filters,
        }
        this.setState({
            filters: _filters,
            pagination: {
                pageno: 0,
                pagesize: 15
            }
        }, () => {
            this.changeSelect();
        })
    }

    render = () => {
        const columns = [
            {
                title: '账户名',
                dataIndex: 'name',
                key: 'id',
                width: '20%'
            }, {
                title: '手机号',
                dataIndex: 'mobile',
                width: '12%'
            }, {
                title: '邮箱',
                dataIndex: 'email',
            }, {
                title: '角色',
                dataIndex: 'authority',
                width: '9%',
                filterMultiple: false,
                filters: [
                    {
                        value: 'admin',
                        text: 'admin'
                    }, {
                        value: 'user',
                        text: 'user'
                    }
                ]
            }, {
                title: '状态',
                dataIndex: 'status',
                width: '10%',
                filtered: this.state.filters.status !== null,
                filteredValue: [String(this.state.filters.status)],
                filterMultiple: false,
                filters: [
                    {
                        value: 0,
                        text: '正常'
                    }, {
                        value: 1,
                        text: '停用'
                    }, {
                        value: 2,
                        text: '注销'
                    }
                ],
                render: (text) => (
                    <span>{text === 0
                            ? '正常'
                            : text === 1
                                ? '停用'
                                : '注销'}</span>
                )
            }, {
                title: '操作',
                key: 'action',
                width: '18%',
                align: 'center',
                render: (text, record) => record.status !== 2 && (
                    <span>
                        <Popconfirm
                            title={`${record.status === 0
                            ? "停用"
                            : "启用"}"账号？`}
                            onConfirm={(e) => this.resetAccount(record, e)}>
                            <a>{record.status === 0
                                    ? "停用"
                                    : "启用"}</a>
                        </Popconfirm>
                        <Divider type="vertical"/>
                        <Popconfirm title="重置密码?" onConfirm={(e) => this.resetPwd(record.id, e)}>
                            <a>重置密码</a>
                        </Popconfirm>
                        <Divider type="vertical"/>
                        <Popconfirm title="注销账号?" onConfirm={(e) => this.onDelete(record.id, e)}>
                            <a>注销账号</a>
                        </Popconfirm>
                    </span>
                )
            }
        ]
        const {visible} = this.state
        const {loading} = this.props.userList
        const scrollHeight = common.getScrollHeight();
        return (
            <Page>
                <Card
                    className="content-box"
                    title="系统账户"
                    extra={(<SearchItems
                    params={this.state.searchItems}
                    clearVisible={false}
                    onAdd={this.showModal}
                    addVisible={true}
                    onSubmit={(filters) => this.onSubmit.call(this, filters)}/>)}>
                    <Table
                        className="table-striped"
                        size="small"
                        locale={{
                        emptyText: (<Empty
                            style={{
                            height: scrollHeight
                        }}/>)
                    }}
                        columns={columns}
                        dataSource={this.props.userList.pageList}
                        rowKey="id"
                        pagination={{
                        current: this.props.userList.pageno + 1,
                        pageSize: this.props.userList.pagesize,
                        ...this.props.userList
                    }}
                        loading={loading}
                        onChange={(pagination, filters) => this.tableChange(pagination, filters)}
                        scroll={{
                        y: scrollHeight
                    }}/>
                    <Adduser
                        visible={visible}
                        handleCancel={this.handleCancel}
                        changeSelect={this.tableChange}/>
                </Card>
            </Page>
        )
    }

}

Products.propTypes = {
    userList: PropTypes.object
}
export default connect(({userList}) => ({userList}))(Products)