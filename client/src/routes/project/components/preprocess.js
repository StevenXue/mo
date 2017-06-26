import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Select, Icon, message, Table, Radio, Input, Collapse, Modal} from 'antd';
import { jupyterServer, flaskServer } from '../../../constants'
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

export default class Preprocess extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      fields: this.props.fields,
      values: {},
      filtered: false,
    }
  }

  convertToStaging() {
    let dataSetId = this.props.dataSetId;
    let values = this.state.values
    if (!dataSetId || !values) {
      return
    }
    let f_t_arrays = Object.keys(values).map((e) => [e, values[e]])
    // console.log('f_t_arrays', f_t_arrays)
    let name;
    if(document.getElementById('stage_data_name')) {
      name = document.getElementById('stage_data_name').value;
    }
    fetch(flaskServer + '/staging_data/staging_data_sets', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'project_id': this.props.project_id,
          'staging_data_set_name': name,
          'staging_data_set_description': 'dsdsds',
          'data_set_id': dataSetId,
          'f_t_arrays': f_t_arrays
        }),
      },
    ).then((response) => response.json())
      .then((res) => {
        console.log('add_staging_data_set_by_data_set_id', res)
        message.success('successfully added to staging data set')
        this.setState({
          notebookName: '',
        })
      })
      .catch((err) => console.log('Error: /staging_data/staging_data_sets', err))
  }

  onRadioChange(ev, field) {
    let values = this.state.values
    values[field] = ev.target.value
    this.setState({
      values
    });
  }

  render(){
    let dsColumns;
    console.log(this.props.dataSetId);
    if(this.props.dataSet.length > 0) {
      dsColumns = Object.keys(this.props.dataSet[0])
        .filter((el) => el !== 'data_set')
        .map((e) => ({
            title: <div>{e}<br/>{this.props.fields[e]}</div>,
            width: 200,
            dataIndex: e,
            key: e,
            filterDropdown: (
              <div className="custom-filter-dropdown">
                <RadioGroup onChange={(ev) => this.onRadioChange(ev, e)} value={this.state.values[e]}>
                  <Radio value={'str'}>String</Radio>
                  <Radio value={'int'}>Integer</Radio>
                  <Radio value={'float'}>Float</Radio>
                </RadioGroup>
              </div>
            ),
            // onFilter: (value, record) => console.log('value, record', value, record),
            filterIcon: <Icon type="info-circle" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />
          })
        )
    }
    return(
      <div>
        <span style={{marginLeft: 20}}>You can modify dataset here</span>
        {dsColumns &&
        <div>
          <Collapse bordered={false} style={{marginTop: 10, width: '100%'}} defaultActiveKey={['1']}>
            <Panel header={"Dateset Preview"} key="1">
              <Table style={{marginTop: -20, width: '100%'}}
                     dataSource={this.props.dataSet}
                     columns={dsColumns}
                     scroll={{x: '200%', y: '100%'}}/>
            </Panel>
            <Panel header={"Missing Value Completion"} key="2">
            </Panel>
          </Collapse>
          <div style={{marginBottom: 10, width: 100, marginLeft: 20, marginTop: 20, display: 'flex', flexDirection: 'row'}}>
            <Input placeholder="enter statge data name"
                   id="stage_data_name"
                   style={{width: 200}}
            />
            <Button type='primary'
                    style={{marginLeft: 20}}
                    onClick={() => this.convertToStaging()}
            >
              Confirm and Stage
            </Button>
          </div>
        </div>
        }
      </div>
    )
  }
}

Preprocess.PropTypes = {
  fields: PropTypes.object,
  dataSet: PropTypes.array,
  project_id: PropTypes.string,
  dataSetId: PropTypes.any
}
