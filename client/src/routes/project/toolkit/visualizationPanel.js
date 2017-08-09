import React from 'react';
import ReactDOM from 'react-dom';
import { BarChart, PieChart, Scatter, Table, SimpleScatter } from '../visualization';
import { jupyterServer, flaskServer } from '../../../constants';
import { Button, Input, Spin, Select, Icon , message, Modal, Popover} from 'antd';
import { isEmpty } from '../../../utils/utils'

export default class VisualizationPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      responseBody: {},
      dataSelected: {},
      selected: '',
      scatterData: {}

    }
  }

  componentDidMount(){
    this.setState({loading: true});
    fetch(flaskServer + '/visualization/visualization/usr2', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "staging_data_set_id": this.props.visual_sds_id
      })
    }).then((response) => response.json())
      .then((res) => {
        this.setState({
          loading: false,
          responseBody: res.response,
        });

        if(res.response.hist_freq){
          let label = Object.keys(res.response.hist_freq);
          this.setState({dataSelected: res.response.hist_freq[label[0]]})
          console.log(this.state.responseBody['hist_freq']);
        }
      });
  }

  onSelectData(values) {
    this.setState({
      selected: values,
      dataSelected: this.state.responseBody.hist_freq[values]
    });
  }

  onSelectDataScatter(value){
    this.setState({selected: value});
    let i = this.state.responseBody['X_fields'].indexOf(value);
    let data = {'x_domain': this.state.responseBody['scatter']['x_domain'][i],
      'y_domain': this.state.responseBody['scatter']['y_domain']}
    this.setState({scatterData: data});
  }

  renderPanel() {
    switch (this.state.responseBody.category){
      case 0:
        return(
          <div className="container" style={{display: 'flex', flexDirection: 'row'}}>
            <div className="left-container" style={{width: '60%'}}>
              {
                this.state.responseBody['centers'] &&
                <Scatter style={{height: '100%'}} data={this.state.responseBody} />
              }
            </div>
            <div className="right-container" style={{width: '40%', display: 'flex', flexDirection: 'column'}}>
              { this.state.responseBody['pie'] &&
              <PieChart data={this.state.responseBody}/>
              }
              {
                !isEmpty(this.state.responseBody) &&
                <Select className="dataset-select"
                        style={{width: 150, margin: 10}}
                        onChange={(values) => this.onSelectData(values)}
                        value={this.state.selected}
                        placeholder="Choose DataSet"
                        allowClear>
                  {
                    this.state.responseBody['hist_freq'] &&
                    Object.keys(this.state.responseBody.hist_freq).map((e) =>
                      <Select.Option value={e} key={e}>
                        {e}
                      </Select.Option>
                    )
                  }
                </Select>
              }
              {
                !isEmpty(this.state.dataSelected) &&
                  <BarChart data={this.state.dataSelected} />
              }
            </div>
          </div>
        );

      case 1:
        return(
          <div className="container" style={{display: 'flex', flexDirection: 'column'}}>
            {
              !isEmpty(this.state.responseBody) &&
              <Table data={this.state.responseBody}/>
            }
            {
              !isEmpty(this.state.responseBody) &&
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{width: '30%'}}>
                  <BarChart data={{x_domain: this.state.responseBody.X_fields, y_domain: this.state.responseBody.bar}}/>
                </div>
                <div style={{width: '40%', marginTop: 20}}>
                  <span style={{ marginLeft: 20 }}>Choose Field</span>
                  <Select style={{width: 100, marginTop: 5, marginLeft: 20}}
                          onChange={(values) => this.onSelectDataScatter(values)}
                          allowClear={false}
                          value={this.state.selected}
                          placeholder="Choose Field">

                    {
                      this.state.responseBody.X_fields.map((e) =>
                        <Select.Option value={e} key={e}>
                          {e}
                        </Select.Option>)
                    }
                  </Select>
                  {
                    !isEmpty(this.state.scatterData) &&
                    <SimpleScatter data={this.state.scatterData} style={{marginTop: -20}}/>
                  }
                  {
                    !isEmpty(this.state.scatterData) &&
                      <div style={{marginTop: -50}}>
                        <div >
                          <span style={{ marginLeft: 20 }}>Pearsonr: </span>
                          <span style={{color: "#00AAAA"}}>{this.state.responseBody['scatter']['pearsonr'][this.state.responseBody['X_fields'].indexOf(this.state.selected)]}</span>
                        </div>
                        <div >
                          <span style={{ marginLeft: 20 }}>MIC: </span>
                          <span style={{color: "#00AAAA"}}>{this.state.responseBody['scatter']['mic'][this.state.responseBody['X_fields'].indexOf(this.state.selected)]}</span>
                        </div>
                      </div>
                  }
                </div>
                <div style={{width: '30%', display: 'flex', flexDirection: 'column', marginTop: 20}}>
                  <div style={{margin: 5}}>
                    <div style={{height: 10, width: '50%', backgroundColor: '#C6DFB5'}}/>
                    <span>Target</span>
                  </div>
                  <div style={{margin: 5}}>
                    <div style={{height: 10, width: '50%', backgroundColor: '#DBDBDB'}}/>
                    <span>Fields</span>
                  </div>
                  {
                    !isEmpty(this.state.responseBody) &&
                      <div style={{margin: 5}}>
                        {
                          Object.keys(this.state.responseBody['general_info']).map((e) =>
                          <div key={e}>
                            <span>{e + ": "}</span>
                            <span style={{color: "#00AAAA"}}>{this.state.responseBody['general_info'][e]}</span>
                          </div>
                          )
                        }
                      </div>
                  }
                </div>
              </div>
            }
          </div>
        )

      case 2:
        return null

      case 3:
        return(
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div className="table_one">
              </div>
              <div className="description">
              </div>
              <div className="table_two">
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div className="pie_one">
                <PieChart data={{'pie': this.state.responseBody['pie1']}}/>
              </div>
              <div className="bar_chart">
              </div>
              <div className="pie_two">
                <PieChart data={{'pie': this.state.responseBody['pie2']}}/>
              </div>
            </div>
          </div>
        );
    }
  }

  render(){
    return(
    <div style={{width: '100%'}}>
      <Spin spinning={this.state.loading}>
        {this.renderPanel()}
      </Spin>
    </div>
    )
  }
}
