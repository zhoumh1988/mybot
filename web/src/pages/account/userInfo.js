import React from 'react'
import {connect} from 'dva'
import {
    Input,
    Icon,
    message,
    Button,
    Card,
    Form,
    Message,
    Row,
    Col
} from 'antd'
import Page from 'components/Page'
import md5 from 'js-md5'
import {getInfo, changePwd, modifyMobiles, modifyEmails} from './service'
import styles from './account.less'

const FormItem = Form.Item;

class Userinfo extends React.Component {
    constructor() {
        super()
        this.state = {
            emailStatu: true,
            mobileStatu: true
        }
        getInfo().then((result) => {
            this.setState({
                emailOld: result.data.email,
                mobileOld: result.data.mobile,
                ...result.data
            })
        })
    }
    requestPwd = () => { //修改密码请求
        if (this.state.pwd && this.state.newPwd) {
            if (this.state.newPwd !== this.state.confirmPwd) {
                Message.warn('两次密码输入不一致！');
                return;
            }
            this.setState({
                pending: true
            }, () => {
                changePwd({
                    pwd: md5(this.state.pwd),
                    newPwd: md5(this.state.newPwd)
                }).then((res) => {
                    if (res.code === 0) {
                        this.setState({pending: false, pwd: '', newPwd: '', confirmPwd: ''})
                        message.success('修改成功')
                    } else {
                        message.error(res.msg)
                    }
                })
            })
        } else {
            message.error('密码不能为空')
        }
    }
    inputChange = (e) => { //input变化赋值
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    edit = (tab) => { //编辑按钮切换状态
        this.setState({[tab]: false})
    }
    editRequest(key) { //编辑请求
        let urls
        let parmas
        if (!this.state[key]) 
            return message.error('修改项不能为空')
        if (key === 'email') {
            urls = modifyEmails
            parmas = {
                email: this.state.email
            }
        } else {
            urls = modifyMobiles
            parmas = {
                mobile: this.state.mobile
            }
        }
        urls(parmas).then((res) => {
            if (res.code === 0) {
                if (key === 'email') {
                    this.setState({emailStatu: true})

                } else {
                    this.setState({mobileStatu: true})
                }
                message.success('修改成功')
            } else {
                message.error(res.msg)
            }

        })
    }
    render = () => {
        const formItemLayout = {
            labelCol: {
                xs: 24,
                sm: 6
            },
            wrapperCol: {
                xs: 24,
                sm: 14
            }
        };
        const iconStyle = {
            fontSize: 16,
            color: '#08c',
            cursor: 'pointer'
        };
        const emailIcon = this.state.emailStatu
            ? <Icon
                    type="edit"
                    onClick={(e) => this.edit('emailStatu', e)}
                    style={iconStyle}/>
            : <Icon
                type="check-circle-o"
                onClick={(e) => this.editRequest('email', e)}
                style={iconStyle}/>

        const mobileIcon = this.state.mobileStatu
            ? <Icon
                    type="edit"
                    onClick={(e) => this.edit('mobileStatu', e)}
                    style={iconStyle}/>
            : <Icon
                type="check-circle-o"
                onClick={(e) => this.editRequest('mobile', e)}
                style={iconStyle}/>;
        return (
            <Page>
                <Row>
                <Col xs={24} sm={11} >
                        <Card
                            title="账户信息"
                            bodyStyle={{
                            padding: 12,
                        }} className={styles.border}>
                            <Form layout="horizontal">
                                <FormItem {...formItemLayout} label="账户">
                                    <span className="ant-form-text">{this.state.name}</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label="角色">
                                    <span className="ant-form-text">{this.state.authority}</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label="邮箱">
                                    <Input
                                        placeholder="email"
                                        onChange={this.inputChange}
                                        name='email'
                                        value={this.state.email}
                                        disabled={this.state.emailStatu}
                                        onPressEnter={(e) => this.editRequest('email', e)}
                                        addonAfter={emailIcon}/>
                                </FormItem>

                                <FormItem {...formItemLayout} label="手机">
                                    <Input
                                        placeholder="mobile"
                                        onChange={this.inputChange}
                                        name='mobile'
                                        value={this.state.mobile}
                                        disabled={this.state.mobileStatu}
                                        onPressEnter={(e) => this.editRequest('mobile', e)}
                                        addonAfter={mobileIcon}
                                        maxLength='11'/>
                                </FormItem>
                            </Form>
                        </Card>
                    </Col>
                    <Col xs={24} sm={{span: 11, offset: 2}}>
                        <Card
                            title="修改密码"
                            bodyStyle={{
                            padding: 12
                        }} className={styles.border}>
                            <Form layout="horizontal">
                                <FormItem {...formItemLayout} label="原密码">
                                    <Input
                                        placeholder="旧密码"
                                        onChange={this.inputChange}
                                        name='pwd'
                                        value={this.state.pwd}
                                        type='password'
                                        autoComplete="off"/>
                                </FormItem>
                                <FormItem {...formItemLayout} label="新密码">
                                    <Input
                                        placeholder="新密码"
                                        onChange={this.inputChange}
                                        name='newPwd'
                                        value={this.state.newPwd}
                                        type='password'
                                        autoComplete="off"/>
                                </FormItem>
                                <FormItem {...formItemLayout} label="确认密码">
                                    <Input
                                        placeholder="确认密码"
                                        onChange={this.inputChange}
                                        name='confirmPwd'
                                        value={this.state.confirmPwd}
                                        type='password'
                                        autoComplete="off"/>
                                </FormItem>
                                <FormItem
                                    wrapperCol={{
                                        xs: 24,
                                        sm: {span: 14, offset: 6}
                                    }}>
                                    <Button onClick={this.requestPwd} type="primary" loading={this.state.pending}>保存密码</Button>
                                </FormItem>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Page>
        )
    }
}
export default connect(() => ({}))(Userinfo)