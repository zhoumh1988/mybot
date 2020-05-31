import React from 'react';
import {
    Modal,
    Form,
    Select,
    Input,
    message,
    TimePicker,
    Col,
    Button,
    Dropdown,
    Menu,
    Icon,
} from 'antd';
import {
    isNotEmpty
} from 'common'
import moment from 'moment';
import service from './service'

const FormItem = Form.Item;
const Textarea = Input.TextArea;
const {Option} = Select;

class KeywordForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            title: '新增关键词',
            fit_type : 1,
            confirmLoading:false,
            ...props
        }
    }

    componentDidMount() {
        const {record = {}} = this.state;
        if(record.id){
            this.setState({
                title: '更新关键词'
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
                values.valid_start=values.valid_start.format('HH:mm:ss')
                values.valid_end=values.valid_end.format("HH:mm:ss")
                this.setState({
                    confirmLoading:true
                })
                values.type = 1;
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
                            if(res.data > 0){
                                message.success('添加成功');
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

    fitType = (value) => {
        const fit_type = value;
        this.setState({
            fit_type
        })
    }

    handleQuickTime = (e) => {
        let valid_start = '';
        let valid_end = '';
        switch (e.key) {
            case 'whole':
                valid_start = moment('00:00:00', 'HH:mm:ss');
                valid_end = moment('23:59:59', 'HH:mm:ss');
                break;
            case 'work':
                valid_start = moment('07:00:00', 'HH:mm:ss');
                valid_end = moment('22:30:00', 'HH:mm:ss');
                break;
            case 'rest':
                valid_start = moment('22:30:00', 'HH:mm:ss');
                valid_end = moment('07:00:00', 'HH:mm:ss');
                break;
            default:
                valid_start = moment('00:00:00', 'HH:mm:ss');
                valid_end = moment('23:59:59', 'HH:mm:ss');
        }
        this
            .props
            .form.setFieldsValue({
                valid_start: valid_start,
                valid_end: valid_end
            })
    }

    render() {
        const {
            getFieldDecorator
        } = this.props.form;
        const modalProps = {
            onCancel: this.handleCancel,
            visible: this.props.visible,
            title: this.state.title,
            onOk: this.handleSubmit,
            confirmLoading: this.state.confirmLoading || false,
            width: 570
        }
        const {
            record
        } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {
                    span: 24
                },
                sm: {
                    span: 4
                },
            },
            wrapperCol: {
                xs: {
                    span: 24
                },
                sm: {
                    span: 20
                },
            },
        };

        const quickTime = (
            <Menu onClick={this.handleQuickTime}>
                <Menu.Item key="whole">全时段（00:00:00-23:59:59）</Menu.Item>
                <Menu.Item key="work">工作时段（07:00:00-22:30:00）</Menu.Item>
                <Menu.Item key="rest">休息时段（22:30:00-07:00:00）</Menu.Item>
            </Menu>
        );
        return (
            <Modal {...modalProps} confirmLoading={this.state.confirmLoading}>
                <Form>
                    <FormItem {...formItemLayout} key="form-fit_type" label={`匹配类型`}>
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
        
                    <FormItem {...formItemLayout} key="form-keyword" label={`关键词`}>
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

                    <FormItem {...formItemLayout} key="form-reply" label={`回复内容`}>
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

                    <FormItem {...formItemLayout} key="form-status" label={`状态`}>
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
                    <FormItem {...formItemLayout} label='工作时间' help="您可通过右侧快捷按钮选择时段">
                        <Col span={8}>
                            <FormItem key="form-valid-start">
                                {getFieldDecorator(`valid_start`, {
                                    initialValue: record.valid_start?moment(record.valid_start, 'HH:mm:ss'):moment('00:00:00','HH:mm:ss'),
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择'
                                        }
                                    ]
                                })(<TimePicker  style={{width:'100%'}} />)}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>-</span>
                        </Col>
                        <Col span={8}>
                            <FormItem key="form-valid-end">
                                {getFieldDecorator(`valid_end`, {
                                    initialValue: record.valid_end?moment(record.valid_end, 'HH:mm:ss'):moment('23:59:59', 'HH:mm:ss'),
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择'
                                        }
                                    ]
                                })(<TimePicker style={{width:'100%'}} />)}
                            </FormItem>
                        </Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            <Dropdown overlay={quickTime}>
                                <Button>选择时段<Icon type="down" /></Button>
                            </Dropdown>
                        </Col>
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(KeywordForm);