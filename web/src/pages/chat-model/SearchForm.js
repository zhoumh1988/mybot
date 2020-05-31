import React from 'react';
import {
    Form,
    Select,
    DatePicker,
    Button,
    Icon
} from 'antd';
import styles from './index.less'
import {listRoom, listContact} from './service'
import moment from 'moment'
import {isNotEmpty} from 'common'

const FormItem = Form.Item;
const {Option} = Select;

class SearchForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            roomList: [],
            contactList: [],
            startValue: null,
            endValue: null,
        }
    }

    componentDidMount() {
        this
            .props
            .form
            .setFieldsValue({
                start: moment()
                    .startOf('day'),
                end: moment()
            });
        listRoom().then((result) => {
            let {data: roomList} = result;
            this.setState({
                roomList: roomList
            }, () => {
                let room = this.state.roomList[0];
                this
                    .props
                    .form
                    .setFieldsValue({roomid: room.id});
                this.handleRoomChange(room.id, room);
                this.handleSearch()
            })
        }).catch((err) => {
            throw err
        });
    }

    handleExport = (e) => {
        e && e.preventDefault();
        this
            .props
            .form
            .validateFields((err, values) => {
                if (isNotEmpty(err)) {
                    return;
                }
                
                if(isNotEmpty(values.start)) {
                    values.start = values.start.format('YYYY-MM-DD HH:mm:ss')
                }

                if(isNotEmpty(values.end)) {
                    values.end = values.end.format('YYYY-MM-DD HH:mm:ss')
                }

                this
                    .props
                    .onExport(values);
            });
    }

    handleSearch = (e) => {
        e && e.preventDefault();
        this
            .props
            .form
            .validateFields((err, values) => {
                if (isNotEmpty(err)) {
                    return;
                }
                
                if(isNotEmpty(values.start)) {
                    values.start = values.start.format('YYYY-MM-DD HH:mm:ss')
                }

                if(isNotEmpty(values.end)) {
                    values.end = values.end.format('YYYY-MM-DD HH:mm:ss')
                }

                this
                    .props
                    .onSearch(values);
            });
    }

    handleRoomChange(roomid) {
        this
            .props
            .form
            .setFieldsValue({roomid: roomid, contacts: []})

        listContact(roomid).then(res => {
            let contactList = res.data;
            if (isNotEmpty(contactList)) {
                this.setState({contactList: contactList})
            }
        })
    }

    handleContactChange(contacts) {
        this
            .props
            .form
            .setFieldsValue({contacts: contacts});
    }

    disabledStartDate = (current) => {
        const endValue = this.state.endValue;
        if(endValue && endValue<moment()){
            return endValue < current;
        }else{
            return moment() < current;
        }
    }
    
    disabledEndDate = (current) => {
        const startValue = this.state.startValue;
        if(startValue){
            return (startValue > current) || (current > moment());
        }else{
            return moment() < current;
        }
    }
    
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }
    
    time = () => {
        this.props.form.validateFields(((err, values) => {
                if(values.start>values.end){
                    this
                        .props
                        .form
                        .setFieldsValue({
                            end: values.start,
                        });
                }
            })
        )
    }
    
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }


    render() {
        const {getFieldDecorator} = this.props.form;
        const {roomList, contactList} = this.state;
        const { startValue, endValue } = this.state;
        return (
            <div className={styles.SearchForm}>
                <Form layout="vertical">
                    <FormItem key="roomid" label={`群组`}>
                        {getFieldDecorator(`roomid`, {rules: []})(
                            <Select
                                placeholder="请选择"
                                onChange={(value, option) => this.handleRoomChange.call(this, value, option)}>
                                {roomList.map(it => (
                                    <Option key={it.id} value={it.id}>{it.name}</Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem key="contacts" label={`微信用户`}>
                        {getFieldDecorator(`contacts`, {rules: []})(
                            <Select
                                maxTagCount={2}
                                mode="multiple"
                                placeholder="请选择"
                                allowClear={true}
                                filterOption={(inputValue, option) => {
                                return isNotEmpty(inputValue) && option
                                    .props
                                    .children
                                    .match(`${inputValue}.*`) !== null;
                            }}
                                onChange={(values) => this.handleContactChange.call(this, values)}>
                                {contactList.map(it => (
                                    <Option key={it.id} value={it.id}>{it.name}</Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem key="start" label={`开始时间`}>
                        {getFieldDecorator(`start`, {rules: []})(
                            <DatePicker
                                style={{
                                width: "100%"
                            }}
                                disabledDate={this.disabledStartDate}
                                format="YYYY-MM-DD HH:mm:ss"
                                setFieldsValue={startValue}
                                onChange={this.onStartChange}
                                onOk={this.time}
                                showTime={true}></DatePicker>
                        )}
                    </FormItem>
                    <FormItem key="end" label={`结束时间`}>
                        {getFieldDecorator(`end`, {rules: []})(
                            <DatePicker
                                style={{
                                    width: "100%"
                                }}
                                disabledDate={this.disabledEndDate}
                                format="YYYY-MM-DD HH:mm:ss"
                                setFieldsValue={endValue}
                                onChange={this.onEndChange}
                                showTime={true}></DatePicker>
                        )}
                    </FormItem>
                </Form>
                <div className={styles.bottonBox}>
                    <Button type="primary" onClick={this.handleSearch}><Icon type="search"/>查询</Button>
                    <Button type="default" onClick={this.handleExport}><Icon type="export"/>导出</Button>
                </div>
            </div>
        );
    }
}

export default Form.create()(SearchForm);