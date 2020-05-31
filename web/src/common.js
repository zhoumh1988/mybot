import moment from 'moment';
import is_empty from 'is-empty';

export const isEmpty = (val) => {
    if (typeof val === 'number') {
        return false;
    } else {
        return is_empty(val);
    }
};
export const isNotEmpty = (val) => {
    return !isEmpty(val);
};

/**
 * @description 格式化时间格式
 * @param {String} date 需要格式化的时间串
 * @param {String} formatter 自定义格式化格式
 */
export const formatDate = (date, formatter = 'YYYY-MM-DD HH:mm:ss') => {
    return moment(date).format(formatter);
};

/**
 * @description 处理分页参数
 * @param {JSONObject} body 分页参数
 */
export const handlePageParams = (pagition) => {
    let {current: pageno, pageSize: pagesize} = pagition;
    pageno -= 1;
    return {pageno, pagesize};
}

export const strlen = (str) => {
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            len += 2;
        }
    }
    return len;
}

// 获取消息类型
export const getMesssageType = (type) => {
    switch (type) {
        case 0:
            return "未知";
        case 1:
            return "文件";
        case 2:
            return "音频（语音）";
        case 3:
            return "联系人";
        case 4:
            return "聊天记录";
        case 5:
            return "表情符号";
        case 6:
            return "图片";
        case 7:
            return "文本";
        case 8:
            return "位置";
        case 9:
            return "小程序";
        case 10:
            return "Money";
        case 11:
            return "Recalled";
        case 12:
            return "分享链接";
        case 13:
            return "视频";
        default: 
            return "未知";
    }
}

const getScrollHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 240;
}

export default {
    isEmpty,
    isNotEmpty,
    moment,
    formatDate,
    handlePageParams,
    strlen,
    getMesssageType,
    getScrollHeight,
};