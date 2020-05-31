import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Table, Card, Modal, Select, Message } from 'antd'
import {Page, Empty, SearchItems} from 'components'
import common from 'common'
import { config } from 'utils'
const { api } = config
const { listRoom } = api
const Option = Select.Option;

class Contact extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {
                pageno: 0,
                pagesize: 15
            },
            ModalText: '',
            visible: false,
            id: '',
            rowKey: '',
            theadFilters: {},
            filters: {},
            manageList: [
                {
                    id: 1,
                    name: '用户'
                }, {
                    id: 2,
                    name: '水军'
                }, {
                    id: 3,
                    name: '管理员'
                }
            ],
            searchItems: [
                {
                    key: 'name',
                    tag: 'input',
                    label: '名字',
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
            ...props
        }
    }
    tableChange(pagination,filters) {
        let filterItems = {
            ...this.state.filters
        }
        if (common.isNotEmpty(filters)) {
            for (let prop in filters) {
                if (typeof prop === 'string' && common.isNotEmpty(filters[prop])) {
                    filterItems[prop] = parseInt(filters[prop][0], 10)||filters[prop][0];
                }
            }
        }
        this.setState({
            filters:filterItems,
            pagination: common.handlePageParams(pagination)
        }, () => {
            this.changeSelect();
        });
    }
    changeSelect() {
        let { pagination, filters } = this.state;
        let params = {
            ...pagination,
            // ...theadFilters,
            ...filters
        }
        this.props.dispatch({ type: 'contact/pageList', payload: params })
    }
    showModal = (record) => {
        let ModalText = '设置角色'
        this.setState({ visible: true, ModalText: ModalText, rowKey: record.id, id: record.role });
    }

    handleOk = () => {
        if (!this.state.id)
            return Message.error('未' + this.state.ModalText)
        let params = {
            role: Number(this.state.id),
            id: this.state.rowKey
        }
        this.setState({ visible: false });
        this.props.dispatch({ type: 'contact/setRole', payload: params})
    }
    handleChange = (value) => {
        this.setState({ id: value })
    }
    handleCancel = () => {
        this.setState({ visible: false })
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
    render() {
        const { visible, ModalText } = this.state
        const scrollHeight = common.getScrollHeight();
        const columns = [
            {
                title: '群组',
                dataIndex: 'topic',
                key: 'topic',
                width: 180
            },
            {
                title: '用户名',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '录入时间',
                dataIndex: 'updated',
                key: 'updated',
                width: 180

            }, {
                title: '角色',
                dataIndex: 'role',
                key: 'role',
                width: 80,
                filterMultiple: false,
                filters: [
                    {
                        text: '用户',
                        value: 1
                    }, {
                        text: '水军',
                        value: 2
                    }, {
                        text: '管理员',
                        value: 3
                    }
                ],
                render: (role) => (role === 1
                    ? '用户'
                    : role === 2
                        ? '水军'
                        : '管理员')
            }, {
                title: '操作',
                key: 'action',
                width: 120,
                align: 'center',
                render: (record) => {
                    return <span>
                        <a onClick={(e) => this.showModal(record, e)}>设置角色</a>
                    </span>
                }
            }
        ]
        const manageList = this
            .state
            .manageList
            .map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
        return (
            <Page>
                <Card className="content-box"
                    title="用户管理"
                    extra={(<SearchItems
                        params={this.state.searchItems}
                        clearVisible={false}
                        onSubmit={(filters) => this.onSubmit.call(this, filters)} />)}>
                    
                    <Table
                        className="table-striped"
                        size="small"
                        locale={{emptyText: (<Empty style={{height: scrollHeight}} />)}}
                        rowKey="id"
                        columns={columns}
                        dataSource={this.props.contact.pageList}
                        pagination={{
                            current: this.props.contact.pageno + 1,
                            pageSize: this.props.contact.pagesize,
                            ...this.props.contact
                        }}
                        scroll={{
                            y: scrollHeight
                        }}
                        onChange={(pagination, filters) => this.tableChange(pagination, filters)} />
                    <Modal
                        width={370}
                        title={ModalText}
                        visible={visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}>
                        <Select
                            style={{
                                width: '100%'
                            }}
                            placeholder="选择角色"
                            optionFilterProp="children"
                            onChange={this.handleChange}
                            value={this.state.id}>
                            {manageList}
                        </Select>
                    </Modal>
                </Card>
            </Page>
        )
    }
}
Contact.propTypes = {
    contact: PropTypes.object,
    showModal: PropTypes.func
}
export default connect(({ contact }) => ({ contact }))(Contact)