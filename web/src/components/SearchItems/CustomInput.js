import React from 'react'
import {Input, Icon} from 'antd'

export default class CustomInput extends React.Component {
    constructor(props) {
        super();
        this.state = {
            ...props
        }
    }

    emitEmpty = () => {
        if(typeof this.props.onEmitEmpty === 'function') {
            this.props.onEmitEmpty();
        }
    }

    handleChange = (value) => {
        if(typeof this.props.onChange === 'function') {
            this.props.onChange(value);
        }
    }

    onPressEnter = (value) => {
        if(typeof this.props.onPressEnter === 'function') {
            this.props.onPressEnter(value);
        }
    }

    render() {
        const {value, placeholder} = this.props;
        const suffix = value
            ? <Icon type="close-circle" onClick={() => this.emitEmpty()}/>
            : null;
        return (
            <Input
                value={value}
                placeholder={placeholder}
                suffix={suffix}
                onChange={((e) => this.handleChange(e.target.value))}
                onPressEnter={(e) => this.props.onPressEnter(e.target.value)}
                type={this.state.type || 'text'}/>
        )
    }
}