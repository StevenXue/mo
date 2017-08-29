import React from 'react'
import { connect } from 'dva'
import Highlight from 'react-highlight'
//import CodeMirror from 'react-codemirror';
import { Tabs } from 'antd'
import './serving.less'
import { pythonCodeOne, pythonCodeTwo } from '../../../utils/utils'
const TabPane = Tabs.TabPane

class ModelDetail extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  render(){
    let content = JSON.parse(this.props.location.query.content)
    console.log(content);
    return(
    <div>
      <div className="serving-container">
        <h1>{content.name}</h1>
        <br/>
        <h2>Basic Info</h2>
        <br/>
        <div className="flex-row">
          <h3 style={{width: 100}}>Version:</h3>
          <Highlight className='python hljs code-container inline-code-container'>
            {content.version}
          </Highlight>
        </div>
        <br/>
        <div className="flex-row">
          <h3 style={{width: 100}}>Model Path:</h3>
          <Highlight className='python hljs code-container inline-code-container'>
            {content.model_base_path}
          </Highlight>
        </div>
        <br/>
        <div className="flex-row">
          <h3 style={{width: 100}}>Input Type:</h3>
          <Highlight className='python hljs code-container inline-code-container'>
            {content.input_type}
          </Highlight>
        </div>
        <br/>
        <h3 style={{width: 100}}>Signature:</h3>
        <div style={{marginLeft: 100, marginTop: -20}}>
          {
            Object.keys(content.signatures).map((e) =>
              <div key={e}>
                <div className="flex-row">
                  <h4 style={{width: 50}}>{e + ': '}</h4>
                  <Highlight className='python hljs code-container inline-code-container'>
                    {content.signatures[e]}
                  </Highlight>
                </div>
                <br/>
              </div>
            )
          }
        </div>
        <br/>
        <h2>gRPC Connection Info</h2>
        <br/>
        {/*<div className='flex-row'>*/}
          {/*<h3 style={{width: 100}}>IP:</h3>*/}
          {/*<Highlight className='python hljs code-container inline-code-container'>*/}
            {/*122.224.116.44*/}
          {/*</Highlight>*/}
        {/*</div>*/}
        {/*<br/>*/}
        <div className='flex-row'>
          <h3 style={{width: 100}}>Server: </h3>
          <Highlight className='python hljs code-container inline-code-container'>
            {content.server}
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
    </div>
    )
  }
}


export default connect(({ serving }) => ({ serving }))(ModelDetail)
