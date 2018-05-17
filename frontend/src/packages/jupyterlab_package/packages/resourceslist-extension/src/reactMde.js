import * as React from 'react'
import ReactMde, { ReactMdeTypes, ReactMdeCommands } from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { Button } from 'antd'
import { connect } from 'dva'
import { get } from 'lodash'
import { Converter } from 'showdown'
import {
  defaultOverview,
} from '@jupyterlab/services'
import '../style/reactMde.css'

export class ReactMdePreview extends React.Component {

  converter = new Converter({
    tables: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs:true,
    tasklists: true,
    strikethrough:true,
    ghCodeBlocks:true,
    emoji: true,
  })

  constructor(props) {
    super(props)
    this.state = {
      reactMdeValue: {
        markdown: get(this.props.project, 'overview', defaultOverview),
      },
    }
  }

  handleValueChange = (value) => {
    this.setState({ reactMdeValue: value })
  }

  startEditOverviewState() {
    this.props.dispatch({
      type: 'projectDetail/setOverviewEditorState',
      overviewEditorState: true,
    })
  }

  render() {
    return (
      <div id='mdeVertical'>
        <ReactMde
          layout='vertical'
          commands={null}
          editorState={this.state.reactMdeValue}
          onChange={this.handleValueChange}
          generateMarkdownPreview={(markdown) => Promise.resolve(this.converter.makeHtml(markdown))}
        />
      </div>
    )
  }
}

export default ReactMdePreview