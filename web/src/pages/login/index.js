import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Row, Form, Input } from 'antd'
import { config } from 'utils'
import styles from './index.less'
import md5 from 'js-md5'
const FormItem = Form.Item

const Login = ({
  loading,
  dispatch,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
  },
}) => {
  function handleOk () {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      values['pwd']=md5(values['pwd'])
      dispatch({ type: 'login/login', payload: values })
    })
  }

  return (
    <div className={styles.form}>
      <div className={styles.logo}>
        {/* <img alt="logo" src={config.logo} /> */}
        <span>{config.name}</span>
      </div>
      <form>
        <FormItem hasFeedback>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message:'请输入账户名'
              },
            ],
          })(<Input onPressEnter={handleOk} placeholder="登录账户名" />)}
        </FormItem>
        <FormItem hasFeedback>
          {getFieldDecorator('pwd', {
            rules: [
              {
                required: true,
                message:'请输入密码'
              },
            ],
          })(<Input type="password" onPressEnter={handleOk} placeholder="登录密码" />)}
        </FormItem>
        <Row>
          <Button type="primary" onClick={handleOk} loading={loading.effects.login}>
            登录
          </Button>
        </Row>
      </form>
    </div>
  )
}

Login.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({ loading }) => ({ loading }))(Form.create()(Login))
