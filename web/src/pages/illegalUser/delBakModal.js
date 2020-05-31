import React from 'react'
import PropTypes from 'prop-types'
import {del} from './service'
import {Modal, Input} from 'antd'

const {TextArea} = Input;

class DelBakModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            confirmLoading: false,
            delBak: '',
            error: false,
            ...props
        }
        this.handleDelOk = this
            .handleDelOk
            .bind(this);
        this.handleDelCancel = this
            .handleDelCancel
            .bind(this);
    }

    handleChange(value) {
        let record = this.state.record;
        record.delBak = value;
        let error = false;
        this.setState({
            record: {
                ...record
            },
            error: error
        })
    }

    handleDelOk() {
        if(this.state.record.delBak && this.state.record.delBak.length>0){
            this.setState({confirmLoading: true}, () => {
                del({
                    id: this.state.record.id,
                    bak: this.state.record.delBak
            }).then(() => {
                    this.setState({confirmLoading: false})
                this
                    .props
                    .handleDelOk()
                })
            })
        }else{
            let error = true;
            this.setState({
                error: error
            })
        }
    }

    handleDelCancel() {
        this
            .props
            .handleDelCancel()
    }

    render() {
        return (
            <Modal
                title="删除"
                visible={this.props.visible}
                onOk={this.handleDelOk}
                confirmLoading={this.state.confirmLoading}
                onCancel={this.handleDelCancel}>
                <TextArea style={this.state.error===true?{border:'1px solid red'}:""} autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入删除备注信息"  onChange={(e) => this.handleChange.call(this, e.target.value)} />
            </Modal>
        )
    }
}

DelBakModal.propTypes = {
    handleDelOk: PropTypes.func
}

export default DelBakModal;