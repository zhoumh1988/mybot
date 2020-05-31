import React from 'react'
import PropTypes from 'prop-types'
import {bakRecord} from './services/chats'
import {Modal, Input} from 'antd'

const {TextArea} = Input;

class BakModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            confirmLoading: false,
            ...props
        }
        this.handleOk = this
            .handleOk
            .bind(this);
        this.handleCancel = this
            .handleCancel
            .bind(this);
    }

    handleChange(value) {
        let record = this.state.record;
        record.bak = value;
        this.setState({
            record: {
                ...record
            }
        })
    }

    handleOk() {
        this.setState({confirmLoading: true}, () => {
            bakRecord({
                id: this.state.record.id,
                bak: this.state.record.bak
            }).then(() => {
                this.setState({confirmLoading: false})
                this
                    .props
                    .handleOk()
            })
        })
    }

    handleCancel() {
        this
            .props
            .handleCancel()
    }

    render() {
        return (
            <Modal
                title="备注"
                visible={this.props.visible}
                onOk={this.handleOk}
                confirmLoading={this.state.confirmLoading}
                onCancel={this.handleCancel}>
                <TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入备注信息" value={this.state.record.bak} onChange={(e) => this.handleChange.call(this, e.target.value)} />
            </Modal>
        )
    }
}

BakModal.propTypes = {
    handleOk: PropTypes.func
}

export default BakModal;