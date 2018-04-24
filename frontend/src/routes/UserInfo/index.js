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
  Button,
  Form,
  Select,
  Modal,
  Upload,
  message
} from 'antd'


import {avatarList} from '../../constants'
import styles from './index.less'
import {showTime} from "../../utils"
import {updateUserInfo,updateUserAccount} from "../../services/user"
import {routerRedux} from "dva/router"
import AvatarEditor from 'react-avatar-editor'

const TabPane = Tabs.TabPane
const {Meta} = Card
const Search = Input.Search
const FormItem = Form.Item
const RadioGroup = Radio.Group
const ButtonGroup = Button.Group
const Option = Select.Option


class EditForm extends React.Component {
  constructor() {
    super()
    this.state = {
      value: 0,
      count: 0,
      modalVisible: false,
      // phone or email
      checkType: 'phone',
      // 手机号 或 邮箱地址
      checkValue: '',
      editEmail: false,
      editContent: ''
    }
  }

  componentDidMount() {
    this.setState({
      checkType: 'phone',
      checkValue: this.props.phone,
    })
  }

  handleSubmitPw = () => {
    let tokenForUpdateInfo = localStorage.getItem('tokenForUpdateInfo')
    this.props.form.validateFields(['password'], {force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          updateUserAccount({
            body: {
              'password': values.password,
              tokenForUpdateInfo
            },
            onJson: () => {
              message.success('密码修改成功')
            }
          })
          this.cancelEdit({})
        }
      },
    )
  }


  handleSubmitEmail = () => {
    let tokenForUpdateInfo = localStorage.getItem('tokenForUpdateInfo')
    this.props.form.validateFields(['email','captcha'], {force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          updateUserAccount({
            body: {
              'email': values.email,
              'captcha':values.captcha,
              tokenForUpdateInfo
            },
            onJson: () => {
              message.success('Email修改成功')
            }
          })
          this.cancelEdit({})
        }
      },
    )
  }


  handleSubmitPhone = () => {
    let tokenForUpdateInfo = localStorage.getItem('tokenForUpdateInfo')
    this.props.form.validateFields(['phone'], {force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          updateUserAccount({
            body: {
              'phone': values.phone,
              'captcha':values.captcha,
              tokenForUpdateInfo
            },
            onJson: () => {
              message.success('手机号修改成功')
            }
          })
          this.cancelEdit({})
        }
      },
    )
  }



  startEdit = (e) => {
    let tokenForUpdateInfo = localStorage.getItem('tokenForUpdateInfo')
    if (tokenForUpdateInfo) {
      this.setState({editContent: e})
    }
    else {
      this.setState({modalVisible: true, toEditContent: e})
    }
  }

  cancelEdit = () => {
    this.setState({modalVisible: false, editContent: '', toEditContent: ''})
  }


  onGetCaptcha = (checkType, type) => {
    let payload
    // 给手机号发送验证码
    if (checkType === 'phone') {
      if (type === 'checkAuth') {
        // 给现有手机号发送验证码，确认修改权限
        payload = {
          phone: this.props.phone
        }
      }
      else if (type === 'new') {
        payload = {
          phone: this.props.form.getFieldValue("phone")
        }
      }
      this.props.dispatch({
        type: "register/sendVerificationCode",
        payload
      })
    }
    // 给邮箱发送验证码
    else if (checkType === 'email') {
      if (type === 'checkAuth') {
        // 给现有手机号发送验证码，确认修改权限
        payload = {
          email: this.props.email
        }
      }
      else if (type === 'new') {
        payload = {
          email: this.props.form.getFieldValue("email")
        }
      }
      this.props.dispatch({
        type: "profile/sendCaptchaToEmail",
        payload
      })
    }
    // // 向后端请求验证码
    // this.props.dispatch({
    //   type: "register/sendVerificationCode",
    //   payload: {
    //     phone: this.props.phone
    //   }
    // })
    let count = 59
    this.setState({count})
    this.interval = setInterval(() => {
      console.log(this.state.count)
      count -= 1
      this.setState({count})
      if (count === 0) {
        clearInterval(this.interval)
      }
    }, 1000)
  }


  checkAuth = (e) => {
    this.props.form.validateFields(['captcha'], {force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          this.props.dispatch({
            type: `profile/twoStepVFC`,
            payload: {
              checkType: this.state.checkType,
              checkValue: this.state.checkValue,
              code: values.captcha,
            },
          })
          this.setState({
            modalVisible: false,
            editContent: this.state.toEditContent
          })
        }
      },
    )
  }

  chechAuthChange = (checkType) => {
    if (checkType === 'phone') {
      this.setState({
        checkType,
        checkValue: this.props.phone
      })
    }
    else if (checkType === 'email') {
      this.setState({
        checkType,
        checkValue: this.props.email
      })
    }
  }


  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    const emptyCommentError = isFieldTouched('value') && getFieldError('value')
    const {count} = this.state
    const {email, phone} = this.props
    const tokenForUpdateInfo = localStorage.getItem('tokenForUpdateInfo')

    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 25},
        sm: {span: 10},
      },
    }

    const passwordFormItemLayout = {
      labelCol: {
        xs: {span: 16},
        sm: {span: 8},
      },
      wrapperCol: {
        xs: {span: 25},
        sm: {span: 10},
      },
    }


    return (
      <div>
        <div className={styles.colName}>
          账号安全
        </div>
        <div className={styles.eachDiv}>
          <p>邮箱：{email.split("@")[0].slice(0, 2)}***@{email.split("@")[1]}</p>
          <p className={styles.modify}
             onClick={() => this.startEdit('email')}>更换邮箱</p>
        </div>
        <Modal
          title="更改邮箱"
          visible={this.state.editContent === 'email'}
          onCancel={this.cancelEdit}
          onOk={this.handleSubmitEmail}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="Email"  {...formItemLayout} style={{padding: '0'}}>
              {getFieldDecorator('email', {
                rules: [{
                  type: 'email', message: 'The input is not valid E-mail!',
                }, {
                  required: true, message: 'Please input your E-mail!',
                }],
              })(
                <Input
                  placeholder="youremail@gmail.com"
                />
              )}
            </FormItem>
            <FormItem>
              <Row gutter={16} type="flex" justify="left" align="top">
                <Col span={5} offset={4}>
                  {getFieldDecorator('captcha', {
                    rules: [{
                      required: true, message: '请输入验证码！',
                    }],
                  })(
                    <Input
                      placeholder="验证码"
                    />
                  )}
                </Col>
                <Col span={5}>
                  <Button
                    disabled={count}
                    className={styles.getCaptcha}
                    onClick={() => this.onGetCaptcha('email', 'new')}
                  >
                    {count ? `${count} s` : '获取验证码'}
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </Form>
        </Modal>
        <div className={styles.eachDiv}>
          <p>手机：{phone.slice(0, 3)}****{phone.slice(-4,)}</p>  <p
          className={styles.modify}
          onClick={() => this.startEdit('phone')}>更换手机</p>
        </div>
        <Modal
          title="更改手机"
          visible={this.state.editContent === 'phone'}
          onCancel={this.cancelEdit}
          onOk={this.handleSubmitPhone}
        >
          <Form>
            <FormItem label="Phone"  {...formItemLayout} style={{padding: '0'}}>
              {getFieldDecorator('phone', {
                rules: [{
                  required: true, message: 'Please input your phone number!',
                }],
              })(
                <Input
                  placeholder=""
                />
              )}
            </FormItem>
            <FormItem>
              <Row gutter={16} type="flex" justify="left" align="top">
                <Col span={5} offset={4}>
                  {getFieldDecorator('captcha', {
                    rules: [{
                      required: true, message: '请输入验证码！',
                    }],
                  })(
                    <Input
                      placeholder="验证码"
                    />
                  )}
                </Col>
                <Col span={5}>
                  <Button
                    disabled={count}
                    className={styles.getCaptcha}
                    onClick={() => this.onGetCaptcha('phone', 'new')}
                  >
                    {count ? `${count} s` : '获取验证码'}
                  </Button>
                </Col>
              </Row>
            </FormItem>
          </Form>
        </Modal>

        <div className={styles.eachDiv}>
          <p>密码</p>
          <p className={styles.modify}
             onClick={() => this.startEdit('password')}>修改密码</p>
        </div>

        <Modal
          title="更改密码"
          visible={this.state.editContent === 'password'}
          onCancel={this.cancelEdit}
          onOk={this.handleSubmitPw}
        >
          <Form onSubmit={this.changePw} style={{padding: '0'}}>
            <FormItem style={{padding: '0'}}
                      label="Password"
                      {...passwordFormItemLayout}
            >
              {getFieldDecorator('password', {
                rules: [{
                  required: true, message: 'Please input your password!',
                }, {
                  validator: this.validateToNextPassword,
                }],
              })(
                <Input type="password"/>
              )}
            </FormItem>
            <FormItem
              {...passwordFormItemLayout}
              label="Confirm Password"
              style={{padding: '0'}}
            >
              {getFieldDecorator('confirm', {
                rules: [{
                  required: true, message: 'Please confirm your password!',
                }, {
                  validator: this.compareToFirstPassword,
                }],
              })(
                <Input type="password"/>
              )}
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title="为了保证你的帐号安全，请验证身份。"
          visible={this.state.modalVisible}
          onCancel={this.cancelEdit}
          onOk={this.checkAuth}
        >
          <div>
            <Select
              value={this.state.checkType}
              onChange={this.chechAuthChange}
            >
              <Option
                value="phone">使用手机 {phone.slice(0, 3)}****{phone.slice(-4,)} 进行验证 </Option>
              <Option
                value="email">使用邮箱 {email.split("@")[0].slice(0, 2)}***@{email.split("@")[1]} 进行验证 </Option>
            </Select>
          </div>
          <div style={{padding: '10px 0'}}>
            <Form>
              <FormItem style={{padding: '0'}}>
                <Row gutter={16} type="flex" justify="left" align="top">
                  <Col span={5}>
                    {getFieldDecorator('captcha', {
                      rules: [{
                        required: true, message: '请输入验证码！',
                      }],
                    })(
                      <Input
                        placeholder="验证码"
                      />
                    )}
                  </Col>
                  <Col span={5}>
                    <Button
                      disabled={count}
                      className={styles.getCaptcha}
                      onClick={() => this.onGetCaptcha(this.state.checkType, 'checkAuth')}
                    >
                      {count ? `${count} s` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}


class GenderEditForm extends React.Component {
  constructor() {
    super()
    this.state = {
      status: 'show',
      value: 2,
    }
  }

  componentDidMount() {
  }

  handleSubmit = () => {
    updateUserInfo({
      body: {
        'gender': this.state.value
      },
      onJson: ({user}) => {
        this.props.dispatch({
          type: 'profile/setUserInfo',
          'userInfo': user
        })
        this.setState({status: 'show'})
      }
    })
  }

  startEdit = () => {
    this.setState({status: 'edit', value: this.props.gender})
  }

  cancelEdit = () => {
    this.setState({status: 'show'})
  }

  onChange = (e) => {
    console.log('radio checked', e.target.value)
    this.setState({
      value: e.target.value,
    })
  }

  render() {
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    const genderDic = {
      '1': '男',
      '0': '女',
      '2': '保密'
    }
    if (this.state.status === 'show') {
      return (
        <div className={styles.eachDiv} style={{paddingLeft: '0'}}>
          <p>性别： {genderDic[this.props.gender.toString()]} </p>
          <p className={styles.modify}
             onClick={this.startEdit}><Icon
            type="edit"/> 修改</p>
        </div>
      )
    }

    else {
      return (
        <div className={styles.eachDiv} style={{paddingLeft: '0'}}>
          <p>性别：</p>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout}>
              <RadioGroup onChange={this.onChange} value={this.state.value}>
                <Radio value={1}>男</Radio>
                <Radio value={0}>女</Radio>
                <Radio value={2}>保密</Radio>
              </RadioGroup>
              <FormItem
                wrapperCol={{span: 12}}
              >
                <Button type="primary" htmlType="submit">保存</Button>
                <Button onClick={this.cancelEdit}>取消</Button>
              </FormItem>
            </FormItem>
          </Form>
        </div>
      )
    }
  }
}


class AvatarEdit extends React.Component {
  constructor() {
    super()
    this.state = {
      previewImage: null,
      previewVisible: false,
      fileList: []
    }
  }

  componentDidMount() {
  }

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    })
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  handleChange = ({fileList}) => {
    let thisFile = fileList[0]
    this.getBase64(thisFile, imageUrl => {
      let newList = [{
        originFileObj: thisFile,
        thumbUrl: imageUrl,
        uid: thisFile.uid
      }]
      console.log(imageUrl)
      this.setState({
        fileList: newList,
        loading: false,
      })
      this.setState({
        previewImage: imageUrl,
        previewVisible: true,
      })
      // this.props.setFieldsValue({[this.props.keyName]: newList[0].thumbUrl})
    })
  }
  handleCancel = () => {
    this.setState({
      previewImage: null,
      previewVisible: false,
      fileList: []
    })
  }

  confirmEdit = () => {
    console.log('editor', this.editor.getImage().toDataURL())
    updateUserInfo({
      body: {
        'avatar': this.editor.getImage().toDataURL()
      },
      onJson: ({user}) => {
        this.props.dispatch({
          type: 'profile/setUserInfo',
          'userInfo': user
        })
        this.handleCancel()
      }
    })
  }

  setEditorRef = (editor) => this.editor = editor

  render() {
    const props = {
      onRemove: (file) => {
        this.setState(({fileList}) => {
          const index = fileList.indexOf(file)
          const newFileList = fileList.slice()
          newFileList.splice(index, 1)
          return {
            fileList: newFileList,
          }
        })
      },
      beforeUpload: (file) => {
        return false
      },
      fileList: this.state.fileList,
    }
    return (
      <div className={styles.photoDiv}>
        <Upload
          {...props}
          className={styles.photoUpload}
          action={URL + '/fake_upload'}
          listType="picture-card"
          fileList={this.state.fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
        >
          {this.state.fileList.length >= 1 ? null :
            <div>
              <img
                src={this.props.avatar ? this.props.avatar : avatarList[this.props.picNumber]}
                alt="avatar"/>
              <div className={styles.picDoc}>修改我的头像</div>
            </div>}
        </Upload>
        <Modal
          visible={this.state.previewVisible}
          onCancel={this.handleCancel}
          onOk={this.confirmEdit}
        >
          <AvatarEditor
            ref={this.setEditorRef}
            image={this.state.previewImage}
            width={250}
            height={250}
            border={50}
            color={[255, 255, 255, 0.6]} // RGBA
            scale={1.2}
            rotate={0}
          />
        </Modal>
      </div>)
  }
}

function SettingProfile({login, profile, dispatch, history}) {
  if (profile.userInfo) {
    const {gender, age, email, name, phone, user_ID, avatar} = profile.userInfo
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
                <AvatarEdit picNumber={picNumber} avatar={avatar}
                            dispatch={dispatch}/>
              </Col>
              <Col span={21}>
                <div>
                  <div className={styles.eachDiv} style={{paddingLeft: '0'}}>
                    <p>昵称： {user_ID}</p>
                  </div>
                  <WrappedGenderEditForm gender={gender} dispatch={dispatch}/>
                </div>
              </Col>
            </Row>
          </div>
          <div>
            <WrappedEditForm email={email} phone={phone} dispatch={dispatch}/>
          </div>
        </div>
      </div>)
  }
  else {
    return (<div/>)
  }
}

const WrappedEditForm = Form.create()(EditForm)
const WrappedGenderEditForm = Form.create()(GenderEditForm)

export default connect(({login, allRequest, profile}) => ({
  login,
  allRequest,
  profile
}))(SettingProfile)


