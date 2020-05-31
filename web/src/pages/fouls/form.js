import React from 'react';
import {Modal, Form, Select, Input, message} from 'antd';
import {isNotEmpty} from 'common'
import service from './service'

const FormItem = Form.Item;
const {Option} = Select;

class FoulForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            title: '新增敏感词',
            confirmLoading:false,
            ...props
        }
    }

    componentDidMount() {
        const {record = {}} = this.state;
        if(record.id){
            this.setState({
                title: '更新敏感词'
            });
        }
    }

    unique = (rule, value, callback) => {
        isNotEmpty(this.inputTimeout) && clearTimeout(this.inputTimeout) && (this.inputTimeout = null);
        if(isNotEmpty(value)) {
            this.inputTimeout = setTimeout(() => {
                service.unique({
                    keyword: value,
                    id: this.state.record.id,
                    type: 2
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
            callback();
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
                this.setState({
                    confirmLoading:true
                })
                values.type = 2;
                values.id = record.id;
                service[isNotEmpty(record.id) ? 'update' : 'add'](values).then(res => {
                    if(res.code === 0) {
                        this.setState({
                            confirmLoading:false
                        })
                        this
                            .props
                            .onSuccess();
                        this
                            .props
                            .form
                            .resetFields();
                        if(record.id){
                            message.success('更新成功');
                        }else{
                            if(res.data.id > 0){
                                message.success('添加成功');
                            }else{
                                message.warn('添加失败');
                            }
                        }
                        
                    } else {
                        this.setState({
                            confirmLoading:false
                        })
                        message.warn(res.msg);
                    }
                })
            });
    }

    handleCancel = () => {
        this.props.onCancel();
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const modalProps = {
            onCancel: this.handleCancel,
            visible: this.props.visible,
            title: this.state.title,
            onOk: this.handleSubmit,
            width: 400
        }
        const {record} = this.state;
        return (
            <Modal {...modalProps} confirmLoading={this.state.confirmLoading}>
                <Form>
                    <FormItem key="form-keyword" label={`敏感词`}>
                        {getFieldDecorator(`keyword`, {
                            initialValue: record.keyword,
                            rules: [
                                {
                                    required: true,
                                    message: '请填写'
                                },
                                {
                                    validator: this.unique,
                                    message: '敏感词已存在'
                                }
                            ]
                        })(<Input placeholder="请填写"/>)}
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

export default Form.create()(FoulForm);