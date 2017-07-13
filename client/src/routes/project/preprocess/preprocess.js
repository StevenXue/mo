import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, message, Table, Radio, Input, Collapse, Select, Tabs, Spin, Modal, Popover} from 'antd';
import { flaskServer } from '../../../constants'
import ColumnOperations from './columnOperation';
import FillMissing from './fillMissing';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

class Preprocess extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      //fields: this.props.fields,
      values: {},
      dataSet: "",
      deleted: {},
      missing_dict: {},
      rows: 0,
      raw_missing: {},
      raw: [],
      stagedId: '',
      //targetTab: '',
      targetDs: [],
      selectedRow: [],
      loading: false,
      visible: false,
      previewCols: [],
      previewDs: [],
      data_set: [],
      fields: {}
    }
  }

  componentDidMount(){
    fetch(flaskServer + '/staging_data/staging_data_sets?project_id=' + this.props.project_id, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({ data_set: res.response });
        },
      );
  }

  missingDataOp(data, fields){
    //let fieldNames = this.state.fields;
    let original = data;
    console.log(fields);
    if(original) {
      message.loading('Please wait while we find out the missing values for you. \n This may take more than 1 minute, please DO NOT refresh page', 3);
      let columns = Object.keys(fields);
      let missing_id = Object.keys(original.missing);
      let missing_dict = {};
      columns.forEach((el) => {
        missing_dict[el] = 0;
      });
      let missing = data.missing;
      missing_id.forEach((el) => {
        let _missing_row = missing[el];
        _missing_row.map((e) => {
          let k = Object.keys(e);
          if( Object.keys(missing_dict).indexOf(k[0]) !== -1){
            missing_dict[k[0]] = missing_dict[k[0]] + 1 ;
          }
        })
      });

      columns.forEach((e) => {
        if(missing_dict[e] === 0){
          delete missing_dict[e];
        }
      });

      let field_names = Object.keys(missing_dict);
      let target = original.data_array_filled.filter((t) => t[field_names[0]] === 'BLANK_GRID');
      //console.log(field_names, target);
      this.setState({
        targetDs: target
      });

      this.setState({
        raw: original.data_array_filled,
        raw_missing: original.missing,
        rows: original.data_array_filled.length,
        missing_dict,
        loading: false
      });

      console.log('missing_dict', missing_dict);

      //console.log("row", original.data_array_filled, "raw_missing", original.missing, "missing_dict", missing_dict);

      message.success('calculation finished');

    }
  }


  openPreview(){
    this.setState({loading: true});
    fetch(flaskServer + '/staging_data/staging_data_sets/' + this.state.dataSet, {
      method: 'get'
    }).then((response) => response.json())
      .then((res) => {
        let preview = res.response.data;
        let cols = Object.keys(preview[0])
          .filter((el) => el !== 'data_set')
          .map((e) => ({
              title: <div>{e}</div>,
              width: 200,
              height: 50,
              dataIndex: e,
              key: e,
            })
          );
        this.setState({
          previewDs: preview,
          previewCols:cols,
          visible: true,
          loading: false
        });
      })
  }

  onSelectDataSet(value){
    this.setState({dataSet: value, loading: true});
    fetch(flaskServer + '/staging_data/staging_data_sets/fields?staging_data_set_id=' + value, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          let values = {};
          let fields = {};
          res.response.forEach((e) => {
              fields[e[0]] = e[1];
              if(e[1][1] === 'string') {
                values[e[0]] = 'str';
              }else if(e[1][1] === 'float'){
                values[e[0]] = 'float';
              }else if(e[1][1] === 'integer'){
                values[e[0]] = 'int';
              }else{
                values[e[0]] = e[1][1];
              }
            }
          );
          console.log(values, fields);

          this.setState({values, fields});

        fetch(flaskServer + '/staging_data/staging_data_sets/integrity/' + value, {
          method: 'get',
        }).then((response) => response.json())
          .then((res) => {
            //console.log(res.response);
            this.missingDataOp(res.response, fields);
          });
        },
      )
      .catch((err) => console.log('Error: /staging_data/staging_data_sets/fields', err));
  }

  render(){
    return(
      <div>
        <span style={{marginLeft: 20}}>Modify staged dataset in your project here.</span>
        <div>
          <Select className="dataset-select"
                  style={{ width: 200, marginTop: 10 , marginLeft: 20}}
                  onChange={(values) => this.onSelectDataSet(values)}
                  value={this.state.dataSet}
                  placeholder="Choose DataSet"
                  allowClear>
            {
              this.state.data_set.map((e) =>
                <Select.Option value={e._id} key={e._id}>
                  {e.name}
                </Select.Option>
              )
            }
          </Select>
          <Spin spinning={this.state.loading}>
          <Collapse bordered={false} style={{marginTop: 10, width: '98%', marginLeft: '1%'}} >
            {
              this.state.missing_dict !== {} &&
              <Panel header={"Missing Value Completion"} key="2">
                <FillMissing
                  raw={this.state.raw}
                  targetDs={this.state.targetDs}
                  missing_dict={this.state.missing_dict}
                  dataSet={this.state.dataSet}
                  rows={this.state.rows}/>
              </Panel>
            }

            {
              this.state.fields !== [] &&
            <Panel header={"Columns Review"} key="3" style={{width: '100%'}}>
              <ColumnOperations
                values={this.state.values}
                stagedId={this.state.data_set}
                dataSet={this.props.dataSet}
                fields={this.state.fields} />
            </Panel>
            }
          </Collapse>
          </Spin>
        </div>

        <div style={{marginLeft: 20, marginTop: 20, display: 'flex', flexDirection: 'row'}}>
          <Button onClick={() => this.openPreview()}>PREVIEW</Button>
          <Modal title="Staged Data Preview"
                  width="1000"
                  visible={this.state.visible}
                  onOk={() => this.setState({visible: false})}
                  onCancel={() => this.setState({visible: false})}
                  >
                  <Table style={{marginTop: -20, width: '100%'}}
                         dataSource={this.state.previewDs}
                         columns={this.state.previewCols}
                         scroll={{x: '200%', y: '100%'}}/>
          </Modal>
        </div>
      </div>
    )
  }
}

Preprocess.PropTypes = {
  fields: PropTypes.object,
  dataSet: PropTypes.array,
  project_id: PropTypes.string,
}

export default connect(({ project }) => ({ project }))(Preprocess)
