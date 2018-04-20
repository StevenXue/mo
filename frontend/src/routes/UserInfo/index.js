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
  Upload
} from 'antd'


import {avatarList} from '../../constants'
import styles from './index.less'
import {showTime} from "../../utils"
import {updateUserInfo} from "../../services/user"
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
      status: 'show',
      value: 0,
      count: 0,
      modalVisible: false,
      chechAuthBy: 'phone'

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
    this.setState({modalVisible: true})
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

  onGetCaptcha = () => {
    // 向后端请求验证码
    this.props.dispatch({
      type: "register/sendVerificationCode",
      payload: {
        phone: this.props.phone
      }
    })
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
    console.log("handleLoginWithPhone")
    this.props.form.validateFields(['phone', 'captcha'], {force: true},
      (err, values) => {
        console.log('values', values)
        if (!err) {
          this.props.dispatch({
            type: `login/loginWithPhone`,
            payload: {
              phone: values.phone,
              code: values.captcha,
            },
          })
        }
      },
    )
  }

  cancelCheckAuth = () => {
    this.setState({modalVisible: false})
  }

  chechAuthChange = (chechAuthBy) => {
    this.setState({chechAuthBy})
  }


  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form
    const emptyCommentError = isFieldTouched('value') && getFieldError('value')
    const {count} = this.state
    const {email, phone} = this.props

    return (
      <div>
        <div className={styles.colName}>
          账号安全
        </div>
        <div className={styles.eachDiv}>
          <p>邮箱：{email.split("@")[0].slice(0, 2)}***@{email.split("@")[1]}</p>
          <p className={styles.modify} onClick={this.startEdit}>更换邮箱</p>
        </div>
        <div className={styles.eachDiv}>
          <p>手机：{phone.slice(0, 3)}****{phone.slice(-4,)}</p>  <p
          className={styles.modify} onClick={this.startEdit}>更换手机</p>
        </div>
        <div className={styles.eachDiv}>
          <p>密码</p>
          <p className={styles.modify} onClick={this.startEdit}>修改密码</p>
        </div>
        <Modal
          title="为了保证你的帐号安全，请验证身份。"
          visible={this.state.modalVisible}
          onCancel={this.cancelCheckAuth}
          onOk={this.checkAuth}
        >
          <div>
            <Select
              value={this.state.chechAuthBy}
              onChange={this.chechAuthChange}
            >
              <Option
                value="phone">使用手机 {phone.slice(0, 3)}****{phone.slice(-4,)} 进行验证 </Option>
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
                      onClick={this.onGetCaptcha}
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
      fileList:[]
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

  getBase64 = (img , callback) => {
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
      fileList:[]
    })
  }

  confirmEdit = () => {
    console.log('editor',this.editor.getImage().toDataURL())
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
        this.setState(({ fileList }) => {
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
            <img src={this.props.avatar?this.props.avatar:avatarList[this.props.picNumber]} alt="avatar"/>
            <div className={styles.picDoc}>修改我的头像</div></div>}
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

                <AvatarEdit picNumber={picNumber}  avatar={avatar} dispatch={dispatch}/>
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


