import React from 'react'
import ReactDOM from 'react-dom'
import ReactMde, {ReactMdeTypes, ReactMdeCommands} from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import {Button} from 'antd'
import {connect} from "dva"
import {get} from 'lodash'
import {Converter} from "showdown"
import styles from './reactMde.less'

class ReactMdeEditor extends React.Component {

  converter = new Converter({
    tables: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs:true,
    tasklists: true,
    strikethrough:true,
    ghCodeBlocks:true,
    emoji: true,
    underline:true,
  })

  constructor(props) {
    super(props)
    this.state = {
      reactMdeValue: {
        markdown: get(this.props.project, 'overview'),
      },
    }
  }

  editOverview() {
    const body = {
      overview: this.state.reactMdeValue.markdown
    }
    this.props.dispatch({
      type: 'projectDetail/updateProjectOverview',
      body,
      projectId: this.props.project._id,
    })
  }

  handleValueChange = (value) => {
    this.setState({
      reactMdeValue: value,
    })
  }

  cancelEdit() {
    this.props.dispatch({
      type: 'projectDetail/setOverviewEditorState',
      overviewEditorState: false
    })
  }

  render() {
    return (
      <div>
        <ReactMde
          layout='tabbed'
          editorState={this.state.reactMdeValue}
          onChange={this.handleValueChange}
          generateMarkdownPreview={(markdown) => Promise.resolve(this.converter.makeHtml(markdown))}
        />
        <div style={{"textAlign": "center", "marginTop": "15px"}}>
          <Button type='primary' style={{marginRight: 15}}
                  onClick={() => {
                    this.editOverview()
                  }}>OK</Button>
          <Button onClick={() => {
            this.cancelEdit()
          }}>Cancel</Button>
        </div>
      </div>
    )
  }
}

export class ReactMdePreview extends React.Component {

  converter = new Converter({
    tables: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs:true,
    tasklists: true,
    strikethrough:true,
    ghCodeBlocks:true,
    emoji: true,
    underline:true
  })

  constructor(props) {
    super(props)
    this.state = {
      reactMdeValue: {
        markdown: get(this.props.project, 'overview'),
      },
    }
  }

  handleValueChange = (value) => {
    this.setState({reactMdeValue: value})
  }

  startEditOverviewState() {
    this.props.dispatch({
      type: 'projectDetail/setOverviewEditorState',
      overviewEditorState: true
    })
  }

  render() {
    return (
      <div className={styles.mdeVertical}>
        <ReactMde
          layout='vertical'
          commands={null}
          editorState={this.state.reactMdeValue}
          onChange={this.handleValueChange}
          generateMarkdownPreview={(markdown) => Promise.resolve(this.converter.makeHtml(markdown))}
        />
        {this.props.ownerOrNot ?
          <div style={{"textAlign": "center"}}><Button
            type='primary' style={{marginTop: 15}}
            onClick={() => {
              this.startEditOverviewState()
            }}>EDIT DESCRIPTION</Button></div> : null}
      </div>
    )
  }
}

export default connect(({projectDetail}) => ({projectDetail}))(ReactMdeEditor)

