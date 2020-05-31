import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import { Card, List, Spin, Button, Avatar} from 'antd'
import {Page, ChatsContent, Empty} from 'components'
import styles from './index.less'
import SearchForm from './SearchForm'
import {isNotEmpty} from 'common'

class ChatModel extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            loadingMore: false,
            ...props
        }
    }

    fetch() {
        let params = {
            pageno: this.state.chatModel.pageno,
            pagesize: this.state.chatModel.pagesize,
            roomid: this.state.roomid
        }
        if(isNotEmpty(this.state.contacts)) {
            params.contacts = this.state.contacts;
        }
        if (isNotEmpty(this.state.start)) {
            params.start = this.state.start;
        }
        if (isNotEmpty(this.state.end)) {
            params.end = this.state.end;
        }
        this
            .props
            .dispatch({type: 'chatModel/pageList', payload: params})
    }

    onSearch(payload) {
        this.setState({
            chatModel: {
                pageno: 0,
                pagesize: 20
            },
            ...payload
        }, () => {
            this.fetch();
        })
    }

    onExport(payload) {
        let params = {
            roomid: payload.roomid
        }
        if(isNotEmpty(payload.contacts)) {
            params.wechat_ids = payload.contacts;
        }
        if (isNotEmpty(payload.start)) {
            params.start = payload.start;
        }
        if (isNotEmpty(payload.end)) {
            params.end = payload.end;
        }
        this
            .props
            .dispatch({type: 'chatModel/export', payload: payload})
    }

    onLoadMore() {
        this.setState({
            chatModel: {
                pageno: this.props.chatModel.pageno + 1,
                pagesize: this.props.chatModel.pagesize
            }
        }, () => {
            this.fetch();
        })
    }

    render() {
        const {loadingMore, loading, isLast, chatList = [], total} = this.props.chatModel;
        const loadMore = total !== 0 && !isLast ? (
            <div style={{textAlign: 'center',lineHeight:'32px',padding:'10px 0px',borderTop:'1px solid #f4f4f4'}}>
              {loadingMore && <Spin />}
              {!loadingMore && <Button style={{color:'#0655f0',border:'1px solid'}} onClick={() => this.onLoadMore()}>加载更多</Button>}
            </div>
          ) : null;

        return (
            <Page>
                <Card className="content-box">
                    <SearchForm onSearch={(params) => this.onSearch(params)} onExport={(params) => this.onExport(params)}/>
                    <div className={`${styles.ChatListContainer} png-overflow`}>
                        {total === 0 && <Empty />}
                        {total !== 0 && <List 
                            loading={loading} 
                            dataSource={chatList} 
                            renderItem={it => (
                                <List.Item key={it.id}>
                                    {it.type===7 &&
                                        <List.Item.Meta 
                                            avatar={<Avatar src={it.avatar} />} 
                                            title={it.contactName}
                                            description={<div className={styles.bg}>{<ChatsContent ellipsis={false} record={it} />}<div className={styles.ChatTime}>{it.created}</div></div>} />}
                                    {it.type===6 &&
                                        <List.Item.Meta 
                                            avatar={<Avatar src={it.avatar} />} 
                                            title={it.contactName}
                                            description={<div>{<ChatsContent record={it} />}</div>} />}
                                    {it.type===5 &&
                                        <List.Item.Meta 
                                            avatar={<Avatar src={it.avatar} />} 
                                            title={it.contactName}
                                            description={<div>{<ChatsContent record={it} />}</div>} />}
                                    {it.type!==6 && it.type!==7 && it.type!==5 &&
                                        <List.Item.Meta 
                                            avatar={<Avatar src={it.avatar} />} 
                                            title={it.contactName}
                                            description={<div className={styles.bd}>{<ChatsContent border={false} record={it} />}<div className={styles.ChatTime}>{it.created}</div></div>} />}
                                </List.Item>
                            )}/>}
                    </div>
                    {loadMore}
                </Card>
            </Page>
        );
    }
}

ChatModel.propTypes = {
    chats: PropTypes.array
};

export default connect(({chatModel, loading}) => ({chatModel, loading}))(ChatModel);