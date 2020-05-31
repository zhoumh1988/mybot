import React from 'react'
import PropTypes from 'prop-types'
import {reply, replyChat} from './service'
import {Modal, Input, Radio, Upload, Icon, Message} from 'antd'
import lrz from 'lrz'

const {TextArea} = Input;
const RadioGroup = Radio.Group;

const Dragger = Upload.Dragger

class ReplyModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            confirmLoading: false,
            replyType: '0',
            msg: "",
            msgPic: "",
            filename: "",
            TextAreaShow: "block",
            DraggerShow: "none",
            tip: "点击或者拖拽文件进行上传",
            nameList: "",
            ...props
        }
        this.handleOk = this
            .handleOk
            .bind(this);
        this.handleCancel = this
            .handleCancel
            .bind(this);
        this.changeRadioGroup = this
            .changeRadioGroup
            .bind(this);
    }
    
    componentDidMount(){
        if(this.props.replyNameList && this.props.replyNameList.length>1){
            this.setState({
                nameList: this.props.replyNameList.join("、")
            })
        }else{
            this.setState({
                nameList: this.props.record.topic
            })
        }
    }

    handleChange(value) {
        this.setState({msg: value})
    }

    handleOk() {
        if(Number(this.state.replyType)===1 && this.state.msgPic.length>0){
            if(this.props.replyList.length>0){
                // 群多选回复
                this.addReply(this.props.replyList)
                // this.props.replyList.forEach(item => this.addReply(item))
            }else{
                if(this.props.type==="roomid") {
                    // 群单独回复
                    this.addReply(this.state.record.roomid)
                }else{
                    // 聊天记录回复
                    this.addReply(this.state.record.id)
                }
            }
        }else if(Number(this.state.replyType)===1 && this.state.msgPic.length<=0){
            Message.error('请添加图片')
        }else if(Number(this.state.replyType)===0 && this.state.msg.length>0){
            if(this.props.replyList.length>0){
                // 群多选回复
                this.addReply(this.props.replyList)
                // this.props.replyList.forEach(item => this.addReply(item))
            }else{
                if(this.props.type==="roomid") {
                    // 群单独回复
                    this.addReply(this.state.record.roomid)
                }else{
                    // 聊天记录回复
                    this.addReply(this.state.record.id)
                }
            }
        }else if(Number(this.state.replyType)===0 && this.state.msg.length<=0){
            Message.error('回复内容不能为空')
        }
    }
    
    addReply(id){
        let data
        if(this.props.type==="roomid"){
            if(Number(this.state.replyType)===1){
                data = {
                    roomid: id,
                    type: this.state.replyType,
                    filename: this.state.filename,
                    msg: this.state.msgPic
                }
            }else{
                data = {
                    roomid: id,
                    type: this.state.replyType,
                    msg: this.state.msg
                }
            }
            this.setState({confirmLoading: true}, () => {
                reply(data).then((res) => {
                    if(res.code === 0){
                        this.setState({confirmLoading: false})
                        this
                            .props
                            .handleOk()
                        Message.success('回复成功')
                    }else{
                        Message.error(res.msg)
                    }
                })
            })
        }else{
            if(Number(this.state.replyType)===1){
                data = {
                    chat_id: id,
                    type: this.state.replyType,
                    filename: this.state.filename,
                    msg: this.state.msgPic
                }
            }else{
                data = {
                    chat_id: id,
                    type: this.state.replyType,
                    msg: this.state.msg
                }
            }
            this.setState({confirmLoading: true}, () => {
                replyChat(data).then((res) => {
                    if(res.code === 0){
                        this.setState({confirmLoading: false})
                        this
                            .props
                            .handleOk()
                        Message.success('回复成功')
                    }else{
                        Message.error(res.msg)  
                    }
                })    
            })
        }
    }

    handleCancel() {
        this
            .props
            .handleCancel()
    }

    changeRadioGroup (e) {
        if(Number(e.target.value)===0){
            this.setState({
                replyType: e.target.value,
                TextAreaShow: "block",
                DraggerShow: "none"
            })
        }else{
            this.setState({
                replyType: e.target.value,
                TextAreaShow: "none",
                DraggerShow: "block"
            })
        }
    }

    render() {
        const {TextAreaShow, DraggerShow} = this.state

        const uploadProp = {
            beforeUpload: (file) => {
                // ...对文件的预处理
                lrz(file, {quality:0.1})
                    .then((rst)=>{
                        // 处理成功会执行
                    if(Math.round(rst.fileLen/100)>700){
                        Message.error('请上传小于1.5MB大小的图片')
                    }else{
                        this.setState({
                            msgPic: rst.base64,
                            filename: file.name,
                            tip: file.name
                        })
                    }
                })
            },
            fileList: this.state.fileList
        }
        
        return (
            <Modal
                title="回复"
                visible={this.props.visible}
                onOk={this.handleOk}
                confirmLoading={this.state.confirmLoading}
                onCancel={this.handleCancel}>
        
                <p>{this.state.nameList}</p>
        
                <RadioGroup onChange={this.changeRadioGroup} value={this.state.replyType}>
                    <Radio value="0">文本</Radio>
                    <Radio value="1">图片</Radio>
                </RadioGroup>
            
                <TextArea style={{display:TextAreaShow,marginTop:20,resize:'none'}} autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入回复信息" onChange={(e) => this.handleChange.call(this, e.target.value)} />

                <div style={{display:DraggerShow,marginTop:20}}>
                    <Dragger {...uploadProp}>
                        <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">{this.state.tip}</p>
                    </Dragger>
                </div>
            </Modal>
        )
    }
}

ReplyModal.propTypes = {
    handleOk: PropTypes.func
}

export default ReplyModal;