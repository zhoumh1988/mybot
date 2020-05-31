import React from 'react'
import {connect} from 'dva'
import {Table, Card, Badge, Divider, Popconfirm} from 'antd'
import PropTypes from 'prop-types'
import {Page, Empty, SearchItems} from 'components'
import common from 'common'
import KeywordForm from './form'

class Fouls extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            searchItems: [
                {
                    key: 'keyword',
                    tag: 'input',
                    label: '敏感词匹配',
                    placeholder: '敏感词匹配'
                }
            ],
            pagination: {
                pageno: 0,
                pagesize: 15
            },
            theadFilters: {},
            filters: {},
            visible: false,
            ...props
        }
    }

    handleTableChange = (pagination, theadFilters) => {
        let filterItems = {}
        if (common.isNotEmpty(theadFilters)) {
            if (common.isNotEmpty(theadFilters.status)) {
                filterItems.status = parseInt(theadFilters.status[0], 10);
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

    fetch() {
        let {pagination, theadFilters, filters} = this.state;
        let params = {
            ...pagination,
            ...theadFilters,
            ...filters
        }
        this
            .props
            .dispatch({type: 'fouls/pageList', payload: params})
    }

    showModal = (record) => {
        this.setState({visible: true, record: record})
    }

    closeModal = (refresh) => {
        this.setState({visible: false, record: {}})
        if (refresh) 
            this.fetch()
    }

    onDelete = (id) => {
        this
            .props
            .dispatch({
                type: 'fouls/del',
                payload: {
                    id: id
                }
            })
    }

    render = () => {
        let {loading} = this.props.fouls;
        const scrollHeight = common.getScrollHeight();

        /** 表头 */
        const columns = [
            {
                title: '敏感词',
                dataIndex: 'keyword',
                key: 'keyword',
                align: 'left'
            }, {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                align: 'left',
                width: 90,
                filterMultiple: false,
                filters: [
                    {
                        text: '停用',
                        value: 0
                    }, {
                        text: '正常',
                        value: 1
                    }
                ],
                render: (text, record) => {
                    const bdage = <Badge
                        dot
                        style={{
                        width: "10px",
                        height: "10px",
                        left: '-5px',
                        backgroundColor: `#${record.status === 0
                            ? 'ff7f79'
                            : '5ff4c3'}`
                    }}/>
                    return record.status === 0
                        ? (
                            <span>{bdage}
                                <span
                                    style={{
                                    marginLeft: '5px'
                                }}>停用</span>
                            </span>
                        )
                        : (
                            <span>{bdage}
                                <span
                                    style={{
                                    marginLeft: '5px'
                                }}>正常</span>
                            </span>
                        )
                }
            }, {
                title: '操作',
                dataIndex: 'id',
                width: 200,
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            <a href="javascript:void(0)" onClick={() => this.showModal(record)}>
                                编辑
                            </a>
                            <Divider type="vertical"/>
                            <Popconfirm title="您确定删除此项吗？" onConfirm={() => this.onDelete(record.id)}>
                                <a href="javascript:void(0)">删除</a>
                            </Popconfirm>
                        </div>
                    );
                }
            }
        ];

        return (
            <Page>
                <Card
                    className="content-box"
                    title="敏感词警告"
                    extra={(<SearchItems
                    params={this.state.searchItems}
                    clearVisible={false}
                    onAdd={() => this.showModal({})}
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
                        rowKey={record => record.id}
                        dataSource={this.props.fouls.pageList}
                        pagination={{
                        current: this.props.fouls.pageno + 1,
                        pageSize: this.props.fouls.pagesize,
                        ...this.props.fouls
                    }}
                        scroll={{
                        y: scrollHeight
                    }}
                        loading={loading}
                        onChange={(pagination, filters) => this.handleTableChange(pagination, filters)}/>
                </Card>
                {this.state.visible && <KeywordForm
                    record={this.state.record}
                    visible={this.state.visible}
                    onCancel={this.closeModal}
                    onSuccess={() => {
                    this.closeModal(true)
                }}/>}
            </Page>
        )
    }
}

Fouls.propTypes = {
    fouls: PropTypes.object
}

// export default Fouls
export default connect(({fouls}) => ({fouls}))(Fouls)