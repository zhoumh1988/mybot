import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Table, Card, Modal, Select, Message , Icon} from 'antd'
import {Page, Empty} from 'components'
import common from 'common'
import { queryOwer, setOwer, setPushMessage } from './service'
// import { Switch } from 'antd';
import ReplyModal from '../../components/ReplyModal/ReplyModal'

const Option = Select.Option;

class Room extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {
                pageno: 0,
                pagesize: 15
            },
            visible: false,
            manageList: [],
            id: '',
            rowKey: '',
            visibleReply: false,
            record_: {},
            replyList: [],
            replyNameList: [],
            ...props
        }

        queryOwer().then(res => {
            this.state.manageList = res.data
        })
    }
    tableChange(pagination) {
        this.setState({
            pagination: common.handlePageParams(pagination)
        }, () => {
            this.changeSelect();
        });
    }
    changeSelect() {
        let { pagination } = this.state;
        let params = {
            ...pagination
        }
        this.props.dispatch({ type: 'rooms/pageList', payload: params })
    }
    showModal = (record) => {
        this.setState({
            visible: true,
            rowKey: record.id,
            id: record.owner_id,
        });
    }

    handleOk = () => {
        if (!this.state.id) return Message.error('未选择设置责任人')
        let parmas = { ownerId: Number(this.state.id), id: this.state.rowKey }
        setOwer(parmas).then((res) => {
            if (res.code === 0) {
                this.setState({
                    visible: false,
                });
                Message.success('设置成功')
                this.changeSelect()
            } else {
                Message.error(res.msg)
            }

        })
    }
    handleChange = (value) => {
        this.setState({ id: value })
    }
    handleCancel = () => {
        this.setState({
            visible: false,
        })
    }

    // 回复弹窗控制
    showReply(record) {
        this.setState({visibleReply: true, record_: record})
    }
    
    closeReplyModal(refresh) {
        this.setState({visibleReply: false, record: {}})
        if(refresh){}
    }

    changeSwitch = (record, type) => {
        let num = 0
    
        if(type){
            num = 1   
        }
        let params = {
            roomid: record.roomid,
            report: num
        }
        setPushMessage(params).then((res) => {
            if (res.code === 0) {
                this.props.dispatch({ type: 'rooms/pageList', payload: params })
            } else {
                Message.error(res.msg)
            }
        })
    }

    onChange = (record, e) => {
        if(e.target.checked){
            if(this.state.replyList.indexOf(record.roomid)===-1){
                this.state.replyList.push(record.roomid)
                this.state.replyNameList.push(record.topic)
            }
        }else{
            if(this.state.replyList.indexOf(record.roomid)!==-1){
                this.state.replyList.splice(this.state.replyList.indexOf(record.roomid), 1);
                this.state.replyNameList.splice(this.state.replyNameList.indexOf(record.topic), 1);
            }
        }
    }

    render() {
        const { visible } = this.state
        const scrollHeight = common.getScrollHeight()
        
        const columns = [
            {
                title: '群组',
                dataIndex: 'topic',
                key: 'topic'
            }, {
                title: '用户数量',
                dataIndex: 'member_num',
                key: 'member_num',
                width:150
            },
            {
                title: '责任人',
                dataIndex: 'owner_name',
                key: 'owner_name',
                width: 200,
                render: (text, record) => {
                    return common.isEmpty(text) ? 
                        (<a onClick={() => this.showModal(record)}>{"设置"}</a>) : (<span>{text} <a onClick={() => this.showModal(record)}><Icon type="edit" /></a></span>)
                }
            },
            // {
            //     title: '消息推送',
            //     width:200,
            //     render: (record) => {
            //         if(record.is_report_day===0){
            //             return <Switch checked={false} onChange={this.changeSwitch.bind(this,record)} />
            //         }else{
            //             return <Switch checked={true} onChange={this.changeSwitch.bind(this,record)} />
            //         }
            //     }
            // },
            // {
            //     title: '操作',
            //     key: 'action',
            //     width: 250,
            //     render: (record) => {
            //         return <a onClick={() => this.showReply.call(this, record)}>回复</a>
            //     },
            // }
        ]
        const {loading, pageList} = this.props.rooms;
        return (
            <Page>
                <Card className="content-box"
                    title="群组管理">
                    <div style={{padding:'0 0 10px'}}>
                        <Table
                            className="table-striped"
                            size="small"
                            locale={{emptyText: (<Empty style={{height: scrollHeight}} />)}}
                            rowKey="id" columns={columns}
                            dataSource={pageList}
                            loading={loading}
                            pagination={false}
                            scroll={{
                                y: scrollHeight
                            }}
                            onChange={(pagination, filters) => this.tableChange(pagination, filters)}
                            />
                    </div>
                    
                    {visible && (
                        <Modal 
                            title='设置责任人'
                            width={370}
                            visible={visible}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}>
                            <Select
                                style={{width: '100%'}}
                                placeholder="请选择"
                                onChange={this.handleChange}
                                value={this.state.id}>
                                {this.state.manageList.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                            </Select>
                        </Modal>
                    )}
                    {this.state.visibleReply && <ReplyModal
                        // 单独群回复
                        record={this.state.record_}
                        // 多选群组回复
                        replyList={this.state.replyList}
                        replyNameList={this.state.replyNameList}
                        // 回复类型 群回复、聊天记录回复
                        type="roomid"
                        visible={this.state.visibleReply}
                        changeRadioGroup={() => this.chengeReplyType.call(this)}
                        handleCancel={() => this.closeReplyModal.call(this, false)}
                        handleOk={() => this.closeReplyModal.call(this, true)}/>}
                </Card>
            </Page>
        )
    }
}
Room.propTypes = {
    rooms: PropTypes.object,
    showModal: PropTypes.func,
    handleOk: PropTypes.func
}
export default connect(({ rooms }) => ({ rooms }))(Room)