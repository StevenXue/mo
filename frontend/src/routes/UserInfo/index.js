import React, {Component} from 'react'
import {connect} from 'dva'
import {
  Card,
  Tabs,
  Icon,
  Radio,
  Row,
  Col,
  Input,
  Pagination,
  Button,
  Form
} from 'antd'

const TabPane = Tabs.TabPane
const {Meta} = Card
const Search = Input.Search
const FormItem = Form.Item

import {avatarList} from '../../constants'
// import avatar1 from '../../img/avatar/1.png'
// import avatar2 from '../../img/avatar/2.png'
// import avatar3 from '../../img/avatar/3.png'
// import avatar4 from '../../img/avatar/4.png'
// import avatar5 from '../../img/avatar/5.png'
// import avatar6 from '../../img/avatar/6.png'
// const avatarList =[avatar1,avatar2,avatar3,avatar4,avatar5,avatar6]

import styles from './index.less'
import {fetchAllUserRequest} from "../../services/userRequest"
import {get_star_favor} from "../../services/user"
import {fetchUserRequestAnswerByUserID} from "../../services/userRequestAnwser"
import {showTime} from "../../utils"
import {routerRedux} from "dva/router"

const RadioGroup = Radio.Group
const ButtonGroup = Button.Group

function callback(key) {
  console.log(key)
}


class EditForm extends React.Component {

  constructor() {
    super()
    this.state = {
      status: 'show'
    }
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  make_update = (values) => {
    // console.log('this.props: ', this.props)
    if (this.props.comments_type === 'request') {
      this.props.dispatch({
        type: 'profile/update',
        payload: {
          edit_item: this.props.edit_item,
          edit_item_value: values['value'],
        }
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values)
        this.make_update(values)
      }
    })
  }

  onBlur = () => {
    this.setState({status: 'show'})
  }

  onClick = () => {
    this.setState({status: 'edit'})
    this.state.input.focus()
  }

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    const emptyCommentError = isFieldTouched('value') && getFieldError('value')
    if (this.state.status === 'show') {
      if (this.props.edit_item === '邮箱') {
        return (
          <div className={styles.eachDiv}>
            <p>邮箱:{this.props.edit_item_value.split("@")[0].slice(0, 2)}***@{this.props.edit_item_value.split("@")[1]}</p>
            <p className={styles.modify} onClick={() => this.onClick()}>更换邮箱</p>
          </div>
        )
      }
      else {
        return (<div>{this.props.edit_item}:{this.props.edit_item_value}</div>)
      }
    }

    else {
      return (

        <Form layout="inline" onSubmit={this.handleSubmit}
              onBlur={() => this.onBlur()}>
          <FormItem
            validateStatus={emptyCommentError ? 'error' : ''}
            help={emptyCommentError || ''}
          >
            {getFieldDecorator('value', {
              rules: [{required: true, message: ''}],
            })(
              <Input className={styles.inputtext}
                     placeholder=""
                     ref={inputRef => (this.state.input = inputRef)}
              />,
            )}
          </FormItem>
        </Form>
      )
    }
  }
}


function SettingProfile({login, profile, dispatch, history}) {
  if (profile.userInfo) {
    const {gender, age, email, name, phone, user_ID} = profile.userInfo
    const {projectNumber} = profile
    const picNumber = parseInt(profile.userInfo._id.slice(20)) % 6
    return (
      <div className={`main-container ${styles.container}`}>
        <div className={styles.all}>
          <div className={styles.colName}>
            <p>我的信息</p>
          </div>
          <div className={styles.headerRow}>
            <Row type="flex" justify="space-around" align="middle">
              <Col span={3} style={{padding: '25px'}}>
                <div className={styles.photoDiv}>
                  <img src={avatarList[picNumber]} alt="avatar"/>
                </div>
              </Col>
              <Col span={21}>
                <div>
                  <div className={styles.eachDiv} style={{paddingLeft: '0'}}>
                    <p>昵称： {user_ID}</p>
                  </div>
                  <div className={styles.eachDiv} style={{paddingLeft: '0'}}>
                    <p>性别： {gender} </p>  <p className={styles.modify}><Icon
                    type="edit"/> 修改</p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div>
            <WrappedEditForm edit_item={'邮箱'} edit_item_value={email}/>
            <div className={styles.colName}>
              账号安全
            </div>
            <div className={styles.eachDiv}>
              <p>邮箱：{email.split("@")[0].slice(0, 2)}***@{email.split("@")[1]}</p>
              <p className={styles.modify}>更换邮箱</p>
            </div>
            <div className={styles.eachDiv}>
              <p>手机：{phone.slice(0, 3)}****{phone.slice(-4,)}</p>  <p
              className={styles.modify}>更换手机</p>
            </div>
            <div className={styles.eachDiv}>
              <p>密码</p>  <p className={styles.modify}>修改密码</p>
            </div>
          </div>
        </div>
      </div>)
  }
  else {
    return (<div/>)
  }
}

const WrappedEditForm = Form.create()(EditForm)
export default connect(({login, allRequest, profile}) => ({
  login,
  allRequest,
  profile
}))(SettingProfile)


