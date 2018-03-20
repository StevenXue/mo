import React from 'react'
import {connect} from 'dva'
import ReactMarkdown from 'react-markdown'
import {Tabs, Switch, Button, Input, Form, Card, Upload, message, Icon} from 'antd'
import {get} from 'lodash'
import {showTime} from '../../utils/index'
import styles from './index.less'
import CONSTANT from '../../constants'

const TabPane = Tabs.TabPane
const {TextArea} = Input
const defaultDocs = CONSTANT.defaultOverviewDocs
//({module, dispatch}
class Docs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isEdit: false,
      doc: '',
    }
  }

  componentWillMount(){
    if(this.props.moduleDetail.doc){
      this.setState({
        doc: this.props.moduleDetail.doc
      })
    }else{
      this.setState({
        doc: defaultDocs
      })
    }

  }

  render(){
    // if()
    return <div className={styles.markdown_container}>
                <TextArea
                  className={styles.textarea}
                  rows={4}
                  // onPressEnter={(e)=>console.log("e", e.target.value)}
                  onChange={(e) => {
                    this.setState({
                      doc: e.target.value
                    })
                  }}
                  value={this.state.doc}
                />

      <ReactMarkdown className={styles.markdown} source={this.state.doc}/>
    </div>
  }

}
class Modules extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isEdit: false,
      doc: '',
    }
  }


  render() {
    const {
      currentModuleId,
      moduleList
    } = this.props.module

    // const {user: {user_ID}} = this.props.login
    const user_ID = localStorage.getItem('user_ID')

    const moduleDetail = moduleList.find(e => e._id === currentModuleId)
    const props1 = {
      name: 'file',
      action: 'http://localhost:5000/file/module',
      headers: {
        authorization: 'authorization-text',
      },
      data: {
        "user_ID": user_ID,
        "module_id": get(moduleDetail, "_id")
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList)
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`)
        }
      },
    }

    return (moduleDetail ?
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.left}>
              <Icon type="user" style={{fontSize: 56}}/>
              <div>
                {get(moduleDetail, 'module_path', "名称")}
              </div>
            </div>


            <div className={styles.right}>
              <Icon type="star-o"/>
              STAR
            </div>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Info" key="1">

              <Card key={moduleDetail._id} title={get(moduleDetail, 'name', "路径")}>
                <div>
                  <p>{get(moduleDetail, 'description', "描述")}</p>
                  <p>{get(moduleDetail, 'create_time') ? showTime(get(moduleDetail, 'create_time')) : '时间'}</p>
                  <p>{get(moduleDetail, 'user', "创建者")}</p>
                </div>
              </Card>

              <Card key={moduleDetail._id + "1"} title={"Example"}>
                <div>
                  <p>{get(moduleDetail, 'input', "输入")}</p>
                  <p>{get(moduleDetail, 'output', "输出")}</p>
                </div>
              </Card>

              <div>
                <Upload {...props1}>
                  <Button>
                    <Icon type="upload"/> Click to Upload
                  </Button>
                </Upload>
              </div>

            </TabPane>

            <TabPane tab="Docs" key="2">
              <Docs moduleDetail={moduleDetail}/>
            </TabPane>

            <TabPane tab="Manage" key="3">CheckList Delete</TabPane>
            <TabPane tab="Source" key="4">Content of Tab Pane 4</TabPane>
          </Tabs>

        </div> : null

    )

    // return (
    //   moduleDetail ?
    //     <div className={`main-container ${styles.normal}`}>
    //       <h2 style={{paddingBottom: 10}}>
    //         {get(moduleDetail, 'name', "名称")}
    //       </h2>
    //
    //       <Card key={moduleDetail._id} title={get(moduleDetail, 'module_path', "路径")}>
    //         <div>
    //           <p>{get(moduleDetail, 'description', "描述")}</p>
    //           <p>{get(moduleDetail, 'create_time') ? showTime(get(moduleDetail, 'create_time')) : '时间'}</p>
    //           <p>{get(moduleDetail, 'user', "创建者")}</p>
    //         </div>
    //       </Card>
    //
    //
    //       <Card key={moduleDetail._id + "1"} title={"Example"}>
    //         <div>
    //           <p>{get(moduleDetail, 'input', "输入")}</p>
    //           <p>{get(moduleDetail, 'output', "输出")}</p>
    //         </div>
    //       </Card>
    //
    //       <div>
    //         <Upload {...props1}>
    //           <Button>
    //             <Icon type="upload" /> Click to Upload
    //           </Button>
    //         </Upload>
    //       </div>
    //
    //     </div> : null
    // )

  }
}

export default connect(({module, login}) => ({module, login}))(Modules)
