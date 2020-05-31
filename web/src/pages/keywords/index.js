import React from 'react'
import {connect} from 'dva'
import {
    Table,
    Card,
    Popover,
    Badge,
    Divider,
    Popconfirm
} from 'antd'
import PropTypes from 'prop-types'
import {Page, Empty, SearchItems} from 'components'
import common from 'common'
import KeywordForm from './form'

class Keywords extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            searchItems: [
                {
                    key: 'keyword',
                    tag: 'input',
                    label: '关键词匹配',
                    placeholder: '关键词匹配'
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
            for (let prop in theadFilters) {
                if (typeof prop === 'string' && common.isNotEmpty(theadFilters[prop])) {
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

    fetch() {
        let {pagination, theadFilters, filters} = this.state;
        let params = {
            ...pagination,
            ...theadFilters,
            ...filters
        }
        this
            .props
            .dispatch({type: 'keywords/pageList', payload: params})
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
                type: 'keywords/del',
                payload: {
                    id: id
                }
            })
    }

    render = () => {
        let {loading} = this.props.keywords;
        const scrollHeight = common.getScrollHeight()

        /** 表头 */
        const columns = [
            {
                title: '关键词',
                dataIndex: 'keyword',
                key: 'keyword',
                align: 'left',
                width: 155
            }, {
                title: '回复',
                dataIndex: 'reply',
                key: 'reply',
                align: 'left',
                render: (text) => (
                    <div className="td-overflow-1">
                        <Popover
                            placement="rightTop"
                            content={(<div
                            style={{
                            maxWidth: 370
                        }}
                            dangerouslySetInnerHTML={{
                            __html: text.replace(/\n/g, '<br>')
                        }}/>)}>
                            <span>{text}</span>
                        </Popover>
                    </div>
                )
            }, {
                title: '匹配类型',
                dataIndex: 'fit_type',
                key: 'fit_type',
                align: 'left',
                width: 120,
                filterMultiple: false,
                filters: [
                    {
                        text: '完全',
                        value: 1
                    }, {
                        text: '模糊',
                        value: 2
                    }
                ],
                render: (text, record) => {
                    return <span>{record.fit_type === 1
                            ? '完全'
                            : '模糊'}</span>
                }
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
                title: '工作时间',
                width: 170,
                align: 'left',
                render: (text, record) => (
                    <div>{record.valid_start}-{record.valid_end}</div>
                )
            }, {
                title: '操作',
                dataIndex: 'id',
                width: 200,
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            <a href="javascript:void(0)" onClick={() => this.showModal(record)}>编辑</a>
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
                    title="关键词回复"
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
                        dataSource={this.props.keywords.pageList}
                        pagination={{
                        current: this.props.keywords.pageno + 1,
                        pageSize: this.props.keywords.pagesize,
                        ...this.props.keywords
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

Keywords.propTypes = {
    keywords: PropTypes.object
}

// export default Keywords
export default connect(({keywords}) => ({keywords}))(Keywords)