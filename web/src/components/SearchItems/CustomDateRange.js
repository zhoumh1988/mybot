import {DatePicker} from 'antd';
import moment from 'moment';
import React from 'react';
import common from 'common'

const RangePicker = DatePicker.RangePicker;

export default class CustomDateRange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props
        }
        this.state.format = props.showTime === true ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
    }

    handleChange(dates, datesStr) {
        if(datesStr[0] === '' && datesStr[1] === '') {
            datesStr = [];
        }
        if(this.props.onChange) {
            this.props.onChange(dates, datesStr);
        }
    }

    render() {
        let value = this.props.value;
        if(common.isNotEmpty(value) && Array.isArray(value) && value.length !== 0) {
            value = [moment(value[0]), moment(value[1])];
        }
        return (
            <div>
                <RangePicker
                    ranges={{
                    '今天': [
                        moment().startOf('day'), moment()
                    ],
                    '昨天': [
                        moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')
                    ],
                    '当月': [
                        moment().startOf('month'), moment()
                    ],
                    '上月': [
                        moment().subtract(1, 'M').startOf('month'), moment().subtract(1, 'M').endOf('month')
                    ]
                }}
                    disabledDate={(current) => moment() < current}
                    showTime={this.state.showTime}
                    format={this.state.format}
                    // onCalendarChange={((dates, datesStr) => this.handleChange.call(this, dates, datesStr))}
                    onChange={((dates, datesStr) => this.handleChange.call(this, dates, datesStr))}
                    value={value} />
            </div>
        )
    }
}