import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { flaskServer } from '../../../constants'

import { Button, message, Table, Radio, Input, Collapse, Card, Tag, Tabs, Spin, Modal, Popover} from 'antd';
const RadioGroup = Radio.Group;

class DataPreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      values: {},
      loading: false,
    }

  }

  convertToStaging() {
    let dataSetId = this.props.project.selectedDSIds;
    let values = this.state.values
    if (!dataSetId || !values) {
      return
    }
    let name;
    let description;
    if(document.getElementById('stage_data_name')) {
      name = document.getElementById('stage_data_name').value;
    }
    if(document.getElementById('stage_description')) {
      description = document.getElementById('stage_description').value;
    }

    let body = {
      'project_id': this.props.project_id,
      'staging_data_set_name': name,
      'staging_data_set_description': description,
      'data_set_id': dataSetId,
    };
    this.props.dispatch({ type: 'project/toStagingData', payload: body});
  }

  render() {
    let dsColumns;
    if(this.props.dataSet.length > 0) {
      dsColumns = Object.keys(this.props.dataSet[0])
        .filter((el) => el !== 'data_set')
        .map((e) => ({
            title: <div>{e}</div>,
            width: 200,
            dataIndex: e,
            key: e
          })
        )
    }
    return(
      <div>
        <p style={{marginLeft: 20}}>Preview your chosen dataset here, remember to rename your chosen dataset and we will make a copy for you for further operations.</p>
        <div>
          <Table style={{marginTop: 5, width: '100%'}}
                 dataSource={this.props.dataSet}
                 columns={dsColumns}
                 scroll={{x: '200%', y: '100%'}}/>
          <div style={{marginBottom: 10, width: 200, marginLeft: 20}}>
            <Input placeholder="enter statge data name"
                   id="stage_data_name"
                   style={{width: 150}}
            />
            <Input style={{marginTop: 10, marginBottom: 5, width: 200}}
                   type="textarea"
                   placeholder="enter statge data description"
                   id='stage_description'
                   rows={2} />
            <Button type='primary'
                    style={{marginLeft: 20}}
                    onClick={() => this.convertToStaging()}
            >
              Confirm and Stage
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(({ project }) => ({ project }))(DataPreview)
