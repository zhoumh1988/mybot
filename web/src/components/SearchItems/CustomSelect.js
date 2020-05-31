import React from 'react'
import {Select} from 'antd'
import common from 'common'
import {request} from 'utils'

const Option = Select.Option;

class CustomSelect extends React.Component {
    constructor(props) {
        super();
        this.state = {
            options: props.options || [
                {
                    id: '',
                    name: '全部'
                }
            ],
            ...props
        }
    }

    componentDidMount() {
        if (common.isNotEmpty(this.state.ajaxOption)) {
            this.ajaxData();
        }
    }

    ajaxData() {
        let {ajaxOption} = this.state;
        // console.log(ajaxOption)
        request({
            url: ajaxOption.url,
            method: ajaxOption.method || 'get',
            data: ajaxOption.data || {}
        }).then(rs => {
            if (rs.data !== null && Array.isArray(rs.data)) {
                rs
                    .data
                    .unshift({id: '', name: '全部'});
                this.setState({options: rs.data})
            }
        });
    }

    handleChange(value, option) {
        if (typeof this.props.onChange === 'function') {
            this
                .props
                .onChange(value, option);
        }
    }

    render() {
        let {defaultValue, options} = this.state;
        defaultValue = common.isNotEmpty(defaultValue)
        ? defaultValue
        : '';

        let value = this.props.value;
        value = common.isNotEmpty(value)
            ? value
            : defaultValue;

        return (
            <Select
                name={this.state.key}
                style={{
                width: '100%'
            }}
                // dropdownMatchSelectWidth={false}
                defaultValue={defaultValue}
                value={value}
                onChange={((value, option) => this.handleChange.call(this, value, option))}>
                {options.map(it => (
                    <Option key={it.id} value={it.id}>{it.name}</Option>
                ))}
            </Select>
        )
    }
}

export default CustomSelect;