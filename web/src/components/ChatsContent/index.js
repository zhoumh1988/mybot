import React, {Component} from 'react'
import {Popover} from 'antd'
import styles from './index.less'
import common from 'common'

export default class ChatsContent extends Component {
    render() {
        const {
            record,
            ellipsis = true,
            border = true
        } = this.props;
        if (record.type === 7) {
            // 文本
            return ellipsis
                ? (
                    <div className="td-overflow-1">
                        <Popover
                            placement="rightTop"
                            content={(<div
                            style={{
                            maxWidth: 370
                        }}
                            dangerouslySetInnerHTML={{
                            __html: record.content.replace(/\n/g, '<br>')
                        }}/>)}>
                            <span>{record.content}</span>
                        </Popover>
                    </div>
                )
                : (
                    <span
                        style={{
                        wordBreak: 'break-all'
                    }}>{record.content}</span>
                )
        } else if (record.type === 6) {
            // 图片
            return (
                <Popover
                    placement="right"
                    content={< img alt = "原图" src = {
                    `/api/common/img/${record.content}`
                }
                style = {{maxHeight: '60vh', maxWidth: '60vw'}}/>}>
                    <img
                        alt="缩略图"
                        src={`/api/common/img/${record.content}`}
                        style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                    }}/>
                </Popover>
            )
        } else if (record.type === 12) {
            // 分享链接
            const detail = JSON.parse(JSON.parse(record.content));
            if (border) {
                return (
                    <a className={styles.Hyperlink} target="_block" href={detail.msg.appmsg.url}>
                        <span className={styles.title}>{detail.msg.appmsg.title}</span>
                        <span
                            className={styles.content}
                            style={{
                            "WebkitBoxOrient": "vertical"
                        }}>{common.isEmpty(detail.msg.appmsg.des)
                                ? ''
                                : detail.msg.appmsg.des}</span>
                    </a>
                )
            } else {
                return (
                    <a
                        className={styles.Hyperlink + " " + styles.border}
                        target="_block"
                        href={detail.msg.appmsg.url}>
                        <span className={styles.title}>{detail.msg.appmsg.title}</span>
                        <span
                            className={styles.content}
                            style={{
                            "WebkitBoxOrient": "vertical"
                        }}>{common.isEmpty(detail.msg.appmsg.des)
                                ? ''
                                : detail.msg.appmsg.des}</span>
                    </a>
                )
            }
        } else if (record.type === 5) {
            // 表情
            const detail = JSON.parse(JSON.parse(record.content));
            return (
                <Popover
                    placement="right"
                    content={< img alt = "原图" src = {
                    detail.msg.emoji.cdnurl
                }
                style = {{maxHeight: '60vh', maxWidth: '60vw'}}/>}>
                    <img
                        alt="缩略图"
                        src={detail.msg.emoji.cdnurl}
                        style={{
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer'
                    }}/>
                </Popover>
            )
        } else if (record.type === 3) {
            // 联系人
            const detail = JSON.parse(JSON.parse(record.content));
            if (border) {
                return (
                    <div className={styles.businessCard}>
                        <div>
                            <img src={detail.msg.smallheadimgurl} alt={detail.msg.nickname}/>
                            <span>{detail.msg.nickname}</span>
                        </div>
                        <p>个人名片</p>
                    </div>
                )
            } else {
                return (
                    <div className={styles.businessCard + " " + styles.border}>
                        <div>
                            <img src={detail.msg.smallheadimgurl} alt={detail.msg.nickname}/>
                            <span>{detail.msg.nickname}</span>
                        </div>
                        <p>个人名片</p>
                    </div>
                )
            }
        } else if (record.type === 9) {
            // 小程序
            const detail = JSON.parse(JSON.parse(record.content));
            // var des = ""; if(typeof detail.msg.appmsg.des === "string"){     des =
            // detail.msg.appmsg.des; }
            if (border) {
                return (
                    <div className={styles.program}>
                        <div>
                            <img
                                src={detail.msg.appmsg.weappinfo.weappiconurl}
                                alt={detail.msg.appmsg.title}/>
                            <span className={styles.title}>{detail.msg.appmsg.sourcedisplayname}</span>
                        </div>
                        <div
                            className={styles.content}
                            style={{
                            "WebkitBoxOrient": "vertical"
                        }}>{detail.msg.appmsg.title}</div>
                        {/* <p>{des}</p> */}
                        <div className={styles.tag}>小程序</div>
                    </div>
                )
            } else {
                return (
                    <div className={styles.program + " " + styles.border}>
                        <div>
                            <img
                                src={detail.msg.appmsg.weappinfo.weappiconurl}
                                alt={detail.msg.appmsg.title}/>
                            <span className={styles.title}>{detail.msg.appmsg.sourcedisplayname}</span>
                        </div>
                        <div
                            className={styles.content}
                            style={{
                            "WebkitBoxOrient": "vertical"
                        }}>{detail.msg.appmsg.title}</div>
                        {/* <p>{des}</p> */}
                        <div className={styles.tag}>小程序</div>
                    </div>
                )
            }
        } else {
            return (
                <span>暂不支持展示，功能持续升级中...</span>
            );
        }
    }
}
