import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import Model from './modelProcess.js';
import { Button, message, Radio, Input, Card, Spin, Select, Tag, Icon} from 'antd';
import { flaskServer } from '../../../constants';


export default class AutomatedModel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data_set: [],
      selectedData: '',
      selectedDataName: '',
      tags: [],
      cols: 0,
      field: '',
      tasks: [],
      row: 0,
      loading: true,
      statusStack: [],
      columns: [],
      //custom: {}
      params: []
    }
  }

  componentDidMount() {
    fetch(flaskServer + '/project/jobs/' + this.props.project_id + '?categories=model', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({ params: res.response.model });
          if(res.response.model.length === 0){
            let statusStack = [true];
            this.setState({statusStack});
          }else{
            let statusStack = [];
            let l = res.response.model.length;
            for(let i = 0; i < l; i++ ){
              statusStack.push(false);
            }
            this.setState({statusStack});
          }

          fetch(flaskServer + '/staging_data/staging_data_sets?project_id=' + this.props.project_id, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((response) => response.json())
            .then((res) =>
                this.setState({ data_set: res.response, loading: false})
            );

        },
      );
  }

  addNewModel(){
    let array = this.state.statusStack;
    array.push(true);
    this.setState({statusStack: array});
  }

  onSelectDataSet (values) {
    let selected = this.state.data_set.filter((el) => el._id === values);
    let selectedName = selected[0].name;
    this.setState({ selectedData: values, selectedDataName: selectedName, loading: true })
    fetch(flaskServer + '/staging_data/staging_data_sets/' + values, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          this.setState({
            cols: res.response.col,
            row: res.response.row,
            tasks: res.response['related tasks'],
            field: res.response.field,
            tags: res.response.tags,
            loading: false
          });
          console.log(res.response);
          let c = Object.keys(res.response.data[1]);
          this.setState({columns: c, loading: false});
        },
      )
      .catch((err) => console.log('Error: /staging_data/staging_data_sets/fields', err))
  }

  deactivate(i){
    console.log("success automodal");
    let array = this.state.statusStack;
    array[i] = false;
    this.setState({statusStack: array});
  }

  render() {
    return(
      <Spin spinning={this.state.loading}>
      <div style={{width: '100%', display: 'flex', flexDirection: 'row', overflowX: 'auto'}}>
        <div style={{width: '25%', marginTop: 10, marginLeft: 10, display: 'flex', height: 500,flexDirection: 'column',
          alignItems: 'center'}}>
          <span style={{color: '#108ee9'}}>Choose Dataset for modelling</span>
          <Select className="dataset-select"
                  style={{ width: '90%', marginTop: 10 }}
                  onChange={(values) => this.onSelectDataSet(values)}
                  value={this.state.selectedData}
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
          {this.state.cols !== 0 &&
          <div style={{marginTop: 15, marginLeft: 10}}>
            <Spin spinning={this.state.loading}>
            <span style={{color: '#108ee9'}}>Dataset Info</span>
            <div>
              <span>{"Number of Fields: "}</span>
              <span style={{color: '#00AAAA'}}>{this.state.cols}</span>
            </div>
            <div>
              <span>{"Number of Records: "}</span>
              <span style={{color: '#00AAAA'}}>{this.state.row}</span>
            </div>
            <div style={{backgroundColor: '#49a9ee', height: 1, marginTop: 5, width: '80%'}} />
            <div style={{marginTop: 10}}>
              <span>{"Category: "}</span>
              <Tag style={{margin: 5}}>
                {this.state.field}
              </Tag>
            </div>
            <div style={{marginTop: 10}}>
              <span>{"Tags: "}</span>
              {
                  this.state.tags.map((e) =>
                    <Tag style={{margin: 5}} key={e}>
                      {e}
                    </Tag>
                    )
              }
            </div>
            <div style={{marginTop: 10}}>
              <span>{"Related Tasks: "}</span>
              {
                this.state.tasks.map((e) =>
                  <Tag style={{margin: 5}} key={e}>
                    {e}
                  </Tag>
                )
              }
            </div>
            </Spin>
          </div>
          }
        </div>
        <div style={{width: 1, backgroundColor: '#EDEDED', height: 500}} />
        <div style={{width: '70%', marginLeft: 10, height: 500, display: 'flex', flexDirection: 'row', overflowX: 'auto'}}>
          <div style={{display: 'flex', flexDirection: 'column', marginLeft: 10}}>
          <div style={{marginLeft: 10}}>
            <span>Models</span>
            { this.state.selectedData !== '' &&
            <Button type='normal' disabled={this.state.selectedData ==='' && true} size='small' style={{marginLeft: 10}} onClick={() => this.addNewModel()}>
              Add New Section
            </Button>
            }
          </div>

          <div style={{ height: 480, overflowY: 'auto', marginTop: 5, backgroundColor: '#fafafa' }}>
            {
              this.state.statusStack.map((el, i) =>
                <Model style={{width: 1200, height: 450}}
                       project_id={this.props.project_id}
                       dataset_id={this.state.selectedData}
                       key={i}
                       cols={this.state.columns}
                       jupyter={false}
                       params={this.state.params[i]}
                       modalSuccess={() => this.deactivate(i)}
                       isActive={el}/>)
            }
          </div>

        </div>
        </div>

      </div>
      </Spin>
    )
  }

}

AutomatedModel.PropTypes = {
  project_id: PropTypes.string
}
