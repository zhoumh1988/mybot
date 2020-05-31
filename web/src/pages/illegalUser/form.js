import React from 'react';
import {Modal, Form, Select, Input, message} from 'antd';
import {isNotEmpty} from 'common'
import service from './service'

const FormItem = Form.Item;
const Textarea = Input.TextArea;
const {Option} = Select;

class IllegalUserForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            title: '违规用户管理',
            fit_type : 1,
            ...props
        }
    }

    componentDidMount() {
    }

    unique = (rule, value, callback) => {
        isNotEmpty(this.inputTimeout) && clearTimeout(this.inputTimeout) && (this.inputTimeout = null);
        if(isNotEmpty(value)) {
            this.inputTimeout = setTimeout(() => { 
                service.unique({
                    keyword: value,
                    id: this.state.record.id,
                    type: 1,
                    fit_type: this.state.fit_type
                }).then(res => {
                    if(res.code === 0) {
                        if(res.data === 0) {
                            callback(false);
                        } else {
                            callback();
                        }
                    } else {
                        message.error(res.msg);
                        callback(false);
                    }
                })
            }, 300);
        } else {
            callback()
        }
    }

    handleSubmit = () => {
        const {record = {}} = this.state;
        this
            .props
            .form
            .validateFields((err, values) => {
                if (isNotEmpty(err)) { 
                    return;
                }
                values.type = 1;
                values.id = record.id;
                service[isNotEmpty(record.id) ? 'update' : 'add'](values).then(res => {
                    if(res.code === 0) {
                        this
                            .props
                            .onSuccess();
                        this
                            .props
                            .form
                            .resetFields();
                        const success = Modal.success({
                            title: '提示',
                            content: '添加成功',
                        });
                        setTimeout(() => success.destroy(), 3000);
                    } else {
                        message.warn(res.msg);
                    }
                })
            });
    }

    handleCancel = () => {
        this.props.onCancel();
    }

    fitType = (value) => {
        const fit_type = value;
        this.setState({
            fit_type
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const modalProps = {
            onCancel: this.handleCancel,
            visible: this.props.visible,
            title: this.state.title,
            onOk: this.handleSubmit,
            confirmLoading: this.state.confirmLoading || false,
            width: 400
        }
        const {record} = this.state;
        return (
            <Modal {...modalProps} >
                <Form>
                    <FormItem key="form-fit_type" label={`匹配类型`}>
                        {getFieldDecorator(`fit_type`, {
                            initialValue: record.fit_type,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择'
                                }
                            ]
                        })(<Select placeholder="请选择" onChange={this.fitType}>
                            <Option key={1} value={1}>完全</Option>
                            <Option key={2} value={2}>模糊</Option>
                        </Select>)}
                    </FormItem>
        
                    <FormItem key="form-keyword" label={`关键词`}>
                        {getFieldDecorator(`keyword`, {
                            initialValue: record.keyword,
                            rules: [
                                {
                                    required: true,
                                    message: '请填写'
                                },
                                {
                                    validator: this.unique,
                                    message: '关键词已存在'
                                }
                            ]
                        })(<Input placeholder="请填写"/>)}
                    </FormItem>

                    <FormItem key="form-reply" label={`回复内容`}>
                        {getFieldDecorator(`reply`, {
                            initialValue: record.reply,
                            rules: [
                                {
                                    required: true,
                                    message: '请填写'
                                }
                            ]
                        })(<Textarea placeholder="请填写" autosize={{minRows: 3, maxRows: 8}}/>)}
                    </FormItem>

                    <FormItem key="form-status" label={`状态`}>
                        {getFieldDecorator(`status`, {
                            initialValue: record.status,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择'
                                }
                            ]
                        })(<Select placeholder="请选择">
                            <Option key={0} value={0}>停用</Option>
                            <Option key={1} value={1}>正常</Option>
                        </Select>)}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(IllegalUserForm);