import React from 'react'
import {connect} from 'dva'
import {Table, Popover, Card, Button, Icon} from 'antd'
import PropTypes from 'prop-types'
import {Page, ReplyModal, ChatsContent, SearchItems, Empty} from 'components'
import common from 'common'
import {config} from 'utils'
import BakModal from './BakModal'

const APIV1 = config.APIV1;

class Chats extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            exporting: false,
            record: {},
            searchItems: [
                {
                    key: 'content',
                    tag: 'input',
                    label: '聊天内容',
                    placeholder: '请输入查询内容'
                },
                {
                    key: 'roomid',
                    tag: 'select',
                    label: '群组',
                    ajaxOption: {
                        url: `${APIV1}/room/listRoom`
                    }
                }, {
                    key: 'daterange',
                    tag: 'daterange',
                    label: '选择时间',
                    span: 11
                }
            ],
            pagination: {
                pageno: 0,
                pagesize: 15
            },
            theadFilters: {},
            filters: {},
            visible: false,
            visibleReply: false,
            ...props
        }
    }

    handleTableChange = (pagination, theadFilters) => {
        let filterItems = {}
        if (common.isNotEmpty(theadFilters)) {
            if (common.isNotEmpty(theadFilters.type)) {
                filterItems.type = parseInt(theadFilters.type[0], 10);
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

    onExport = () => {
        const {filters} = this.state;
        this
            .props
            .dispatch({type: 'chats/export', payload: filters})
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
            .dispatch({type: 'chats/pageList', payload: params})
    }

    showModal(record) {
        this.setState({visible: true, record: record})
    }

    closeModal(refresh) {
        this.setState({visible: false, record: {}})
        if(refresh) this.fetch()
    }

    // 回复弹窗控制
    showReply(record) {
        this.setState({visibleReply: true, record: record})
    }

    closeReplyModal(refresh) {
        this.setState({visibleReply: false, record: {}})
        if(refresh) this.fetch()
    }

    chengeReplyType(record){
        console.log(record)
    }

    render = () => {
        let {loading} = this.props.chats;
        const scrollHeight = common.getScrollHeight();

        /** 表头 */
        const columns = [
            {
                title: '群组',
                dataIndex: 'topic',
                key: 'topic',
                width: 160
            },{
                title: '发言人',
                dataIndex: 'contactName',
                key: 'contactName',
                width: 140
            }, {
                title: '内容',
                key: 'content',
                width: 300,
                align: 'left',
                render: (text, record) => {
                    return <ChatsContent record={record}/>
                }
            }, {
                title: '内容类型',
                dataIndex: 'type',
                key: 'type',
                width: 140,
                filterMultiple: false,
                align: 'left',
                filters: [
                    {
                        text: '文本',
                        value: 7
                    },
                    {
                        text: '图片',
                        value: 6
                    },
                    {
                        text: '联系人',
                        value: 3
                    },
                    {
                        text: '表情',
                        value: 5
                    },
                    {
                        text: '小程序',
                        value: 9
                    },
                    {
                        text: '分享链接',
                        value: 12
                    }
                ],
                render: (text, record) => {
                    return <span>{common.getMesssageType(record.type)}</span>
                }
            }, {
                title: '发言时间',
                dataIndex: 'created',
                key: 'created',
                width: 200
            }, {
                title: '操作',
                dataIndex: 'id',
                width: 120,
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            {common.isEmpty(record.bak)
                            ?  (<a onClick={() => this.showModal.call(this, record)}>备注</a>) 
                            :  (<Popover title="备注" placement="topLeft" content={<div style={{maxWidth: '400px'}}>{record.bak}</div>}>
                                    <a onClick={() => this.showModal.call(this, record)}>已备注</a>
                                </Popover>)}
                            {/* | <a onClick={() => this.showReply.call(this, record)}>回复</a> */}
                        </div>
                    );
                }
            }
        ];

        return (
            <Page>
                <Card className="content-box"
                    title="聊天记录"
                    extra={(<SearchItems
                        params={this.state.searchItems}
                        onClear={() => this.onClear.call(this)}
                        onSubmit={(filters) => this.onSubmit.call(this, filters)}
                        customButtons={<Button onClick={this.onExport}><Icon type="export" />导出检索</Button>} />)}>
                    
                    <Table
                        className="table-striped"
                        size="small"
                        locale={{emptyText: (<Empty style={{height: scrollHeight}} />)}}
                        columns={columns}
                        rowKey={record => record.id}
                        dataSource={this.props.chats.pageList}
                        pagination={{
                            current: this.props.chats.pageno + 1,
                            pageSize: this.props.chats.pagesize,
                            showQuickJumper: true,
                            showTotal: total => `总共 ${total} 条记录`,
                            ...this.props.chats
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
                
                {this.state.visibleReply && <ReplyModal
                    record={this.state.record}
                    replyList={[]}
                    replyNameList={[]}
                    type="chat_id"
                    visible={this.state.visibleReply}
                    changeRadioGroup={() => this.chengeReplyType.call(this)}
                    handleCancel={() => this.closeReplyModal.call(this, false)}
                    handleOk={() => this.closeReplyModal.call(this, true)}/>}
            </Page>
        )
    }
}

Chats.propTypes = {
    chats: PropTypes.object
}

// export default Chats
export default connect(({chats}) => ({chats}))(Chats)