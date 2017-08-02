import React from 'react';
import ReactDOM from 'react-dom';
import { BarChart, PieChart, Scatter } from '../visualization';
import { jupyterServer, flaskServer } from '../../../constants';
import { Button, Input, Spin, Select, Icon , message, Modal, Popover} from 'antd';


export default class VisualizationPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      responseBody: {},
      dataSelected: {},
      selected: ''
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
        let label = Object.keys(res.response.hist_freq);
        this.setState({dataSelected: res.response.hist_freq[label[0]]})
        console.log(this.state.responseBody['hist_freq']);
      });
  }

  onSelectData(values){
    this.setState({
      selected: values,
      dataSelected: this.state.responseBody.hist_freq[values]
    });
  }

  render(){
    return(
    <div style={{width: '100%'}}>
      <Spin spinning={this.state.loading}>
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
            { !isEmpty(this.state.dataSelected) &&
              <BarChart data={this.state.dataSelected} />
            }
          </div>
        </div>
      </Spin>
    </div>
    )
  }
}
