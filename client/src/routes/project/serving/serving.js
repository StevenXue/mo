import React from 'react'
import { connect } from 'dva'
import Highlight from 'react-highlight'
//import CodeMirror from 'react-codemirror';
import { Tabs } from 'antd'
import './serving.less'
import { pythonCodeOne, pythonCodeTwo } from '../../../utils/utils'


const TabPane = Tabs.TabPane

class Serving extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
  }

  render () {
    return (
      <div className="serving-container">
        <h2>gRPC Connection Info</h2>
        <br/>
        <div className='flex-row'>
          <h3 style={{width: 35}}>IP:</h3>
          <Highlight className='python hljs code-container inline-code-container'>
            122.224.116.44
          </Highlight>
        </div>
        <br/>
        <div className='flex-row'>
          <h3 style={{width: 35}}>Port: </h3>
          <Highlight className='python hljs code-container inline-code-container'>
            9000
          </Highlight>
        </div>
        <br/>
        <h3>Example:</h3>
        <Tabs defaultActiveKey="1" size="small" className='code-tabs'>
          <TabPane tab="Python" key="1">
            <Highlight className='python hljs code-container'>
              {pythonCodeOne}
            </Highlight>
            {/*<CodeMirror value={pythonCodeOne} options={{lineNumbers: true}}/>*/}
          </TabPane>
          <TabPane tab="JavaScript" disabled key="2">Content of tab 2</TabPane>
          <TabPane tab="Java" disabled key="3">Content of tab 3</TabPane>
        </Tabs>
        <br/>
        <h3>Model Signature:</h3>
        <Tabs defaultActiveKey="1" size="small" className='code-tabs'>
          <TabPane tab="Python" key="1">
            <Highlight className='python hljs code-container'>
              {pythonCodeTwo}
            </Highlight>
            {/*<CodeMirror value={pythonCodeTwo} options={{lineNumbers: true}}/>*/}
          </TabPane>
          <TabPane tab="JavaScript" disabled key="2">Content of tab 2</TabPane>
          <TabPane tab="Java" disabled key="3">Content of tab 3</TabPane>
        </Tabs>
      </div>
    )
  }
}

Serving.PropTypes = {}

export default connect(({ project }) => ({ project }))(Serving)
