import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import classnames from 'classnames'
import { Button, message, Table, Radio, Input, Collapse, Card, Tag, Tabs, Spin, Modal, Popover } from 'antd'

const RadioGroup = Radio.Group

import { flaskServer } from '../../../constants'
import styles from './detail.css'

const textStyle = { marginLeft: 20, fontSize: 14, color: '#108ee9' }

class DataPreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      values: {},
      loading: false,
    }

  }

  convertToStaging () {
    let dataSetId = this.props.project.selectedDSIds
    let values = this.state.values
    if (!dataSetId || !values) {
      return
    }
    let name
    let description
    if (document.getElementById('stage_data_name')) {
      name = document.getElementById('stage_data_name').value
    }
    if (document.getElementById('stage_description')) {
      description = document.getElementById('stage_description').value
    }

    let body = {
      'project_id': this.props.project_id,
      'staging_data_set_name': name,
      'staging_data_set_description': description,
      'data_set_id': dataSetId,
    }
    this.props.dispatch({ type: 'project/toStagingData', payload: body })
  }

  getWidth (columns) {
    return 100 * columns.length
  }

  render () {
    if(this.props.project.selectedDSIds.length === 0) {
      return <p style={textStyle}>Please select a data set first</p>
    }
    let dsColumns
    if (Array.isArray(this.props.dataSet) && this.props.dataSet.length > 0) {
      dsColumns = Object.keys(this.props.dataSet[0]).filter((el) => el !== 'data_set')
      dsColumns = dsColumns.filter((el) => el !== '_id')
      dsColumns = dsColumns.filter((el) => el !== 'staging_dataset_id')
      dsColumns = dsColumns.map((e) => ({
          title: <div>{e}</div>,
          width: 100,
          dataIndex: e,
          key: e,
        }),
      )
    }
    return (
      <div>
        <Spin spinning={this.props.project.loading}>
          <div>
            {this.props.file && this.props.file.type === 'table' ? <div>
              <p style={textStyle}>Preview your chosen dataset here, remember
                to rename your chosen dataset and we will make a copy for you for further operations.</p>
              <Table style={{ marginTop: 5, width: '100%' }}
                     dataSource={this.props.dataSet}
                     columns={dsColumns}
                     pagination={false}
                     scroll={{ x: this.getWidth(dsColumns), y: '100%' }}/>
            </div> : <div>
              <h3 style={{marginLeft: 20}}>{this.props.dataSetName}</h3>
              <p style={textStyle}>No Preview for Unstructured Data for Now</p>
            </div>
            }
            <div style={{ marginBottom: 10, marginTop: 20, marginLeft: 20 }}>
              <div style={{ marginBottom: 10 }}>
                <span>{'Staging Dataset Name: '}</span>
                <Input className={classnames(styles.nameInput)}
                       placeholder="enter statge data name"
                       id="stage_data_name"
                />
              </div>
              <span>{'Staging Dataset Description: '}</span>
              <br/>
              <Input style={{ marginBottom: 5, width: 200 }}
                     type="textarea"
                     placeholder="enter statge data description"
                     id='stage_description'
                     rows={2}/>
            </div>
            <Button type='primary'
                    style={{ marginLeft: 20 }}
                    onClick={() => this.convertToStaging()}
            >
              Confirm and Stage
            </Button>
          </div>
        </Spin>
      </div>
    )
  }
}

export default connect(({ project }) => ({ project }))(DataPreview)
