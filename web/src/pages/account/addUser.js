import React from 'react'
import {connect} from 'dva'
import {
    Form,
    Icon,
    Input,
    Select,
    Modal,
    Message
} from 'antd'
import {isNotEmpty} from 'common'
import {addUser, uniques} from './service'

const FormItem = Form.Item
const Option = Select.Option
class NormalLoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props,
            confirmLoading: false
        }
    }
    checkEmail = (rule, value, callback) => {
        if (value) {
            var myreg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
            if (!myreg.test(value)) {
                callback(false);
            } else {
                callback();
            }
        } else {
            callback();
        }

    }
    isPoneAvailable = (rule, value, callback) => {
        if (value) {
            var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
            if (!myreg.test(value)) {
                callback(false);
            } else {
                callback();
            }
        } else {
            callback();
        }
    }
    unique = (rule, value, callback) => {
        isNotEmpty(this.inputTimeout) && clearTimeout(this.inputTimeout) && (this.inputTimeout = null);
        if (isNotEmpty(value)) {
            this.inputTimeout = setTimeout(() => {
                uniques({
                    value: value
                }, rule.field).then(res => {
                    if (res.code === 0) {
                        if (res.data === 0) {
                            callback(false);
                        } else {
                            callback();
                        }
                    } else {
                        Message.error(res.msg);
                        callback(false);
                    }
                })
            }, 300);
        } else {
            callback()
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this
            .props
            .form
            .validateFields((err, values) => {
                if (!err) {
                    this.setState({confirmLoading: true})
                    addUser(values).then(res => {
                        this.setState({confirmLoading: false})
                        if (res.code === 0) {
                            Message.success('添加成功')
                            this
                                .props
                                .form
                                .resetFields();
                            this
                                .props
                                .handleCancel('change')
                        } else {
                            Message.error(res.msg)
                        }
                    })
                }
            });
    }
    handleChange = (value) => {
        console.log(`selected ${value}`);
    }
    handleCancel = () => {
        this
            .props
            .handleCancel()
        this
            .props
            .form
            .resetFields();
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Modal
                title="添加账户"
                visible={this.props.visible}
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
                confirmLoading={this.state.confirmLoading}>
                <Form onSubmit={this.handleSubmit} className="login-form ">
                    <FormItem>
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入账户名!'
                                }
                            ]
                        })(
                            <Input
                                prefix={< Icon type = "user" style = {{ color: 'rgba(0,0,0,.25)' }}/>}
                                placeholder="账户名"
                                maxLength='20'/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('email', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入邮箱!'
                                }, {
                                    validator: this.checkEmail,
                                    message: '邮箱不正确'
                                }, {
                                    validator: this.unique,
                                    message: '邮箱已存在'
                                }
                            ]
                        })(
                            <Input
                                prefix={< Icon type = "mail" style = {{ color: 'rgba(0,0,0,.25)' }}/>}
                                placeholder="邮箱"/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('mobile', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入手机号!'
                                }, {
                                    validator: this.isPoneAvailable,
                                    message: '手机号不正确'
                                }, {
                                    validator: this.unique,
                                    message: '手机号已存在'
                                }
                            ]
                        })(
                            <Input
                                prefix={< Icon type = "mobile" style = {{ color: 'rgba(0,0,0,.25)' }}/>}
                                placeholder="手机号"
                                maxLength={11}/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('authority', {
                            initialValue: 'user',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please select authority!'
                                }
                            ]
                        })(
                            <Select onChange={this.handleChange}>
                                <Option value="user">user</Option>
                                <Option value="admin">admin</Option>
                            </Select>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);
export default connect(() => ({}))(WrappedNormalLoginForm)