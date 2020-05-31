import React from 'react'
import {Button, Icon} from 'antd'
import PropTypes from 'prop-types'
import {CustomSelect, CustomInput, CustomDateRange} from './custom'
import styles from './index.less'
import common from 'common';
import classnames from 'classnames'

const ButtonGroup = Button.Group;

class SearchItems extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filters: {},
            clearVisible: true,
            addVisible: false,
            ...props
        }
    }
    onChange(key, value) {
        let filters = this.state.filters;
        filters[key] = value;
        this.setState({filters: filters});
    }
    onEmitEmpty = (key) => {
        let filters = this.state.filters;
        filters[key] = '';
        this.setState({filters: filters});
        if (this.props.onSubmit) {
            this
                .props
                .onSubmit(filters);
        }
    }

    onPressEnter = (key, value) => {
        let filters = this.state.filters;
        filters[key] = value;
        this.setState({filters: filters});
        if (this.props.onSubmit) {
            this
                .props
                .onSubmit(filters);
        }
    }
    onSubmit() {
        let {
            filters = {}
        } = this.state
        if (this.props.onSubmit) {
            this
                .props
                .onSubmit(filters);
        }
    }
    onClear() {
        this.setState({filters: {}})
        if (this.props.onClear) {
            this
                .props
                .onClear();
        }
    }
    onAdd = () => {
        if (this.props.onAdd) {
            this
                .props
                .onAdd();
        }
    }
    render() {
        let {
            filters = {},
            customButtons
        } = this.state;
        return (
            <div
                className={styles.search}>
                {this
                    .props
                    .params
                    .map((it, idx) => {
                        return (
                            <div key={`lb-search-${idx}`} className={classnames(styles.searchItem, {[styles.searchRangePicker]: it.tag === 'daterange'})}>
                                {it.tag === 'select' && (() => (<CustomSelect
                                    value={common.isEmpty(filters[it.key]) ? '' : filters[it.key]}
                                    onChange={(value) => this.onChange.call(this, it.key, value)}
                                    {...it}/>))()}
                                {it.tag === 'input' && (() => (<CustomInput
                                    value={common.isEmpty(filters[it.key]) ? '' : filters[it.key]}
                                    onPressEnter={(value) => this.onPressEnter(it.key, value)}
                                    onEmitEmpty={() => this.onEmitEmpty(it.key)}
                                    onChange={(value) => this.onChange.call(this, it.key, value)}
                                    {...it}/>))()}
                                {it.tag === 'daterange' && (() => (<CustomDateRange
                                    value={common.isEmpty(filters[it.key]) ? '' : filters[it.key]}
                                    onChange={(dates, datesStr) => this.onChange.call(this, it.key, datesStr)}
                                    {...it}/>))()}
                            </div>
                        )
                    })}
                <ButtonGroup className={styles.actions}>
                    <Button onClick={() => this.onSubmit.call(this)}><Icon type="search"/>查询</Button>
                    {this.state.clearVisible && <Button onClick={() => this.onClear.call(this)}><Icon type="delete"/>清空</Button>}
                    {this.state.addVisible && <Button onClick={this.onAdd}><Icon type="plus"/>新增</Button>}
                    {customButtons}
                </ButtonGroup>
            </div>
        )
    }
}

SearchItems.propTypes = {
    onSubmit: PropTypes.func,
    onClear: PropTypes.func,
    params: PropTypes.array
}

export default SearchItems;