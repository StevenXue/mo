import React, { Component } from 'react'
import { Button, Modal, Icon, Steps } from 'antd'
import Joyride from 'react-joyride'
import gifNew from '../../img/gif/new.gif'
import gifImport from '../../img/gif/import.gif'
import gifDeploy from '../../img/gif/deploy.gif'
import { connect } from 'dva'
import _ from 'lodash'
import styles from './index.less'

const Step = Steps.Step
const gitList = [gifNew, gifImport, gifDeploy]
const titleList = ['1/3 创建项目', '2/3 使用module', '3/3 部署项目']
const JOYRIDE = [
  {
    text: '新建文件',
    selector: 'button.jp-AddIcon.jp-MaterialIcon',
    position: 'bottom',
    // width: "80px"
  },

  {
    text: '上传文件',
    selector: 'button.jp-id-upload.jp-Toolbar-item',
    position: 'bottom',
    // width: "80px"
  },
  {
    text: '部署',
    selector: 'button.jp-LauncherIcon',
    position: 'bottom',
    // width: "60px"
  },

  {
    text: '生成py文件',
    selector: '.p-Widget.jp-NotebookPanel.jp-Document.jp-Activity.p-DockPanel-widget[class$=p-DockPanel-widget] button.jp-PythonIcon',
    position: 'bottom',
  },
  {
    text: '输出操作',
    selector: '.p-Widget.jp-NotebookPanel.jp-Document.jp-Activity.p-DockPanel-widget[class$=p-DockPanel-widget] select.jp-Notebook-toolbarCellTypeDropdown.jp-mod-styled#Insert',
    position: 'bottom',
  },
  {
    text: 'jupyter notebook 运行状态',
    selector: '.p-Widget.jp-NotebookPanel.jp-Document.jp-Activity.p-DockPanel-widget[class$=p-DockPanel-widget] div.jp-CircleIcon',
    position: 'bottom-left',
    width: '140px',
  },

  {
    text: '模块列表',
    selector: 'li.ModulesLabel',
    position: 'left',
    width: '120px',
    tooltipOffset: 50,
  },
  {
    text: '数据集列表',
    selector: 'li.p-TabBar-tab.DatasetsLabel',
    position: 'left',
    width: '120px',
    tooltipOffset: 50,
  },
]
const [imgWidth, imgHeight, scale] = [1920, 1023, 2.3]

const convertAllSteps = () => {
  let result = JOYRIDE.map((ele) => {
    if (!document.querySelector(ele.selector)) {
      return
    }
    return [
      {
        text: ele.text,
        selector: ele.selector,
        position: ele.position,
        isFixed: true,
        style: {
          borderRadius: 0,
          color: '#34BFE2',
          textAlign: 'center',
          width: ele.width ? ele.width : '5rem',
          mainColor: '#ffffff',
          backgroundColor: '#ffffff',
          main: {
            padding: '1px',
          },
          header: {
            display: 'none',
          },
          close: {
            display: 'none',
          },
          footer: {
            display: 'none',
          },
          skip: {
            display: 'none',
          },
        },
      },
    ]
  })
  return result.filter((item) => item !== undefined)
}

class HelpButton extends React.Component {
  state = {
    run: false,
    allSteps: [],
    steps: [],
    steps2: [],
    visible: false,

    helpState: 0,
    isNotebookLoaded: false,
  }

  componentDidMount() {
    window.addEventListener('trigger_tooltip', () => {
      // 当notebook 加载完成触发
      this.setState({ isNotebookLoaded: true })

      // 自动显示tooltip, 延迟 2s 等html完全加载 （需求更改，注释掉了）
      // setTimeout(() => {
      //   // this.setState({ run: true })
      //   this.setState({
      //     allSteps: convertAllSteps(),
      //   })
      // }, 2000)

    }, false)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.projectDetail.project) {
      const AutoShowHelp = _.get(nextProps.projectDetail.project, 'auto_show_help')
      if (AutoShowHelp) {
        this.setState({
          visible: true,
        })
      }
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    })
  }
  handleOk = (e) => {
    console.log(e)
    this.setState({
      visible: false,
    })
  }
  handleCancel = (e) => {
    console.log(e)
    this.setState({
      visible: false,
    })
    this.props.dispatch({
      type: 'projectDetail/updateProjectIsAutoHelp',
      payload: {
        auto_show_help: false,
      },
    })

  }

  handleOnClick = () => {
    if (this.state.run) {
      for (let i = 0, len = JOYRIDE.length; i < len; i++) {
        this[`joyride${i}`].reset()
      }
    }
    const allSteps = convertAllSteps()
    this.setState({
      allSteps: allSteps,
    })
    this.setState({ run: !this.state.run })
  }

  // 使用教程弹窗
  renderHelp = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/*标题*/}
        <div style={{ fontSize: 30, padding: 20 }}>
          {titleList[this.state.helpState]}
        </div>
        {/*图片*/}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {this.state.helpState !== 0 ?
            <Icon type="left" style={{ fontSize: 40, color: ' #c1c1c1' }}
                  onClick={() => {
                    if (this.state.helpState === 0) {
                      return
                    }
                    this.setState({ helpState: this.state.helpState - 1 })

                  }}
            /> : <Icon type="left" style={{ fontSize: 40, color: 'transparent' }}/>}
          <img style={{
            width: imgWidth / scale, height: imgHeight / scale,
            marginTop: 8,
            marginBottom: 50,
            border: '1px solid #c1c1c1',
          }}
               src={gitList[this.state.helpState]} alt='loading...'/>
          <Icon type="right" style={{ fontSize: 40, color: ' #c1c1c1' }}
                onClick={() => {
                  if (this.state.helpState === titleList.length - 1) {
                    this.setState({ helpState: 0 })

                  } else {
                    this.setState({ helpState: this.state.helpState + 1 })
                  }

                }}
          />
        </div>
        {/*底部*/}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Steps current={this.state.helpState + 1} progressDot={(dot, { status, index }) => (
            <div>
              {dot}
            </div>
          )}>
            {titleList.map((e, index) => <Step key={e} status={this.state.helpState === index ? 'finish' : 'wait'}/>)}
            <Step status={'wait'}/>
          </Steps>
        </div>
      </div>
    )

  }

  render() {
    return <div className={styles.notebook_joyride}
                style={this.state.isNotebookLoaded ? null : { display: 'none' }}
    >
      {
        JOYRIDE.map((ele, index) => {
            return (
              <Joyride
                key={ele.text + ele.selector}
                ref={c => (this[`joyride${index}`] = c)}
                debug={false}
                run={this.state.run}
                steps={this.state.allSteps[index]}
                autoStart
                tooltipOffset={ele.tooltipOffset ? ele.tooltipOffset : 2}
                showOverlay={false}
                holePadding={0}
                scrollToSteps={false}
              />
            )
          },
        )
      }
      <div className={styles.cbtn}>
        <Button
          size="small"
          onMouseEnter={this.handleOnClick}
          onMouseLeave={this.handleOnClick}
          style={{
            borderWidth: 0,
            color: '#1890ff',
          }}
        >
          Hint
        </Button>
        <div>
          <Button size="small"
                  onClick={this.showModal}
                  style={{
                    borderWidth: 0,
                    color: '#1890ff',
                  }}
          >Tips</Button>
          <Modal
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
            width={imgWidth / scale + 100}
            bodyStyle={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {this.renderHelp()}
          </Modal>
        </div>
      </div>
    </div>
  }
}

export default connect(({ projectDetail }) => ({ projectDetail }))(HelpButton)

