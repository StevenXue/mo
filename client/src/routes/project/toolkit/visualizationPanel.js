import React from 'react'
import { BarChart, Histogram, PieChart, Scatter, SimpleScatter, SimpleTable, Table } from '../visualization'
import { flaskServer } from '../../../constants'
import { Card, Select, Spin, Popover, Icon} from 'antd'
import { isEmpty } from '../../../utils/utils'
import classnames from 'classnames';
import style from './toolkit.css';


export default class VisualizationPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      responseBody: {},
      dataSelected: {},
      selected: '',
      scatterData: {},
      selectedColOne: 0,
      selectedColTwo: 0

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

        console.log(res.response);

        if(res.response.category && res.response.category === 2){
          this.setState({selectedColOne: 0, selectedColTwo: 0})
        }else if(res.response.category && res.response.category === 1){
          this.setState({selected: res.response.X_fields[0]});
          let data = {'x_domain': this.state.responseBody['scatter']['x_domain'][0],
            'y_domain': this.state.responseBody['scatter']['y_domain']}
          this.setState({scatterData: data});
        }

        if(res.response.hist_freq){
          let label = Object.keys(res.response.hist_freq);
          this.setState({dataSelected: res.response.hist_freq[label[0]]})
          console.log(res.response, label);
          this.setState({selected: Object.keys(res.response.hist_freq)[0]})
        }
      });
  }

  onSelectData(values) {
    this.setState({
      selected: values,
      dataSelected: this.state.responseBody.hist_freq[values]
    });
    console.log(this.state.responseBody.hist_freq[values]);
  }

  onSelectDataScatter(value){
    this.setState({selected: value});
    let i = this.state.responseBody['X_fields'].indexOf(value);
    let data = {'x_domain': this.state.responseBody['scatter']['x_domain'][i],
      'y_domain': this.state.responseBody['scatter']['y_domain']}
    this.setState({scatterData: data});
  }

  renderArray(value){
    if( value instanceof Array) {
      return value.map((e) =>
        <div>
          <span key={e} style={{color: "#00AAAA"}}>{e}</span>
          <br/>
        </div>)
    }else{
      return(
      <span style={{color: "#00AAAA"}}>{value}</span>
      )
    }
  }

  renderColSelection(chart){
    let titles = chart.map((e, index) => ({
      'index': index,
      'name': e.field
    }))
    return titles.map((e) =>
      <Select.Option value={e.index} key={e.index}>
        {e.name}
      </Select.Option>
    )
  }

  renderCase2BarChart(chart){
    if(this.state.responseBody['bar1']) {
      if(chart === 'bar1'){
        let x_len = this.state.responseBody['bar1'][this.state.selectedColOne].x_domain.length;
        let y_len = this.state.responseBody['bar1'][this.state.selectedColOne].y_domain.length;
        if( x_len === y_len) {
          return <BarChart data={this.state.responseBody['bar1'][this.state.selectedColOne]} />
        }else{
          return <Histogram data={this.state.responseBody['bar1'][this.state.selectedColOne]} />
        }
      }else{
        let x_len = this.state.responseBody['bar2'][this.state.selectedColTwo].x_domain.length;
        let y_len = this.state.responseBody['bar2'][this.state.selectedColTwo].y_domain.length;
        if( x_len === y_len) {
          return <BarChart data={this.state.responseBody['bar2'][this.state.selectedColTwo]} />
        }else{
          return <Histogram data={this.state.responseBody['bar2'][this.state.selectedColTwo]} />
        }
      }
    }

  }

  renderPanel() {
    switch (this.state.responseBody.category){
      case 0:
        return(
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{textAlign: 'center'}}>
              <h2>聚类</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <Card title={"聚类散点图"} className="left-container" style={{width: '60%', margin: 5}}>
                {
                  !isEmpty(this.state.responseBody) &&
                  <div style={{marginTop: 50, marginLeft: '5%', marginBottom: -30}}>
                    <div >
                      <span>Number of Clusters: </span>
                      <span style={{color: "#00AAAA"}}>{this.state.responseBody['general_info']['Number of Clusters']}</span>
                    </div>
                    <div >
                      <span>SSE: </span>
                      <span style={{color: "#00AAAA"}}>{this.state.responseBody['general_info']['SSE']}</span>
                    </div>
                  </div>
                }
                {
                  this.state.responseBody['centers'] &&
                  <Scatter data={this.state.responseBody} />
                }
              </Card>
              <div className="right-container" style={{width: '40%', display: 'flex', flexDirection: 'column'}}>
                <Card title={"簇内点数数量占比"} style={{margin: 5}}>
                  { this.state.responseBody['pie'] &&
                  <PieChart data={this.state.responseBody} type={'cluster'} />
                  }
                </Card>
                <Card title={"数据分布"} style={{margin: 5}}>
                {
                  !isEmpty(this.state.responseBody) &&
                    <div style={{ marginLeft: 20}}>
                      <span style={{color: "#00AAAA"}}>选择栏位来预览数据分布图</span>
                      <Select className="dataset-select"
                              style={{width: 150, margin: 10, zIndex: 100, marginTop: 30}}
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
                    </div>
                }
                {
                  !isEmpty(this.state.dataSelected) &&
                    <div style={{marginTop: -30}}>
                      {this.state.dataSelected.x_domain.length > this.state.dataSelected.y_domain.length?
                        <Histogram data={this.state.dataSelected} />
                        :<BarChart data={this.state.dataSelected} />
                      }
                    </div>
                }
                </Card>
              </div>
            </div>
          </div>
        );

      case 1:
        return(
          <div className="container" style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{textAlign: 'center'}}>
              <h2>特征选择</h2>
            </div>
            {
              !isEmpty(this.state.responseBody) &&
                <Table data={this.state.responseBody}/>
            }
            {
              !isEmpty(this.state.responseBody) &&
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Card title="被选择栏位评分" style={{width: '30%' , margin: 5}}>
                  <p>{"评分满分大部分为1分"}</p>
                  <div style={{marginTop: -20}}>
                    <BarChart data={{x_domain: this.state.responseBody.X_fields, y_domain: this.state.responseBody.bar}}/>
                  </div>
                </Card>
                <Card title="各栏位与目标项相关系数分析图" style={{width: '40%' , margin: 5}}>
                  <span style={{ marginLeft: 20 }}>Choose Field</span>
                  <Select style={{width: 100, marginTop: 5, marginLeft: 20, zIndex: 100}}
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
                      <div style={{height: 270, marginTop: -20}}>
                        <SimpleScatter data={this.state.scatterData} yName={this.state.responseBody.Y_target[0]} xName={this.state.selected}/>
                      </div>
                  }
                  {
                    !isEmpty(this.state.scatterData) &&
                      <div style={{marginTop: -20}}>
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
                </Card>
                <Card title="图例和其它参数" style={{width: '30%', display: 'flex', flexDirection: 'column', margin: 5}}>
                  <div style={{marginLeft: 20, marginBottom: 10}}>
                    <div style={{height: 20, width: 100, backgroundColor: '#C6DFB5'}}/>
                    <span>选做目标的栏位</span>
                  </div>
                  <div style={{marginLeft: 20, marginBottom: 10}}>
                    <div style={{height: 20, width: 100, backgroundColor: '#DBDBDB'}}/>
                    <span>被选择的栏位</span>
                    {/*<span style={{color: 'rgba(192, 149, 122, 1)'}}>{text}</span>*/}
                  </div>
                  <div style={{marginLeft: 20, marginBottom: 10}}>
                    <div style={{height: 20, width: 100, backgroundColor: '#DBDBDB'}}>
                      <span style={{color: 'rgba(192, 149, 122, 1)', marginLeft: 5}}>{'text'}</span>
                    </div>
                    <span>与目标有关的栏位</span>
                  </div>
                  {
                    !isEmpty(this.state.responseBody) &&
                      <div style={{margin: 20}}>
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
                </Card>
              </div>
            }
          </div>
        )

      case 2:
        return (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{textAlign: 'center', marginBottom: 10}}>
              <h2>数值转换</h2>
            </div>
            <Card title="转换前">
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                  <SimpleTable data={{
                    table: this.state.responseBody['table1']['data'],
                    target: this.state.responseBody['table1']['field']
                  }}/>
                  <div className="right-charts">
                    <div style={{width: 300, height: 300}}>
                      <span style={{color: '#00AAAA'}}>{"查看原始数据分布"}</span>
                      <Select style={{width: 100, marginTop: 5, marginLeft: 20}}
                              onChange={(values) => this.setState({selectedColOne: values})}
                              allowClear={false}
                              value={this.state.selectedColOne}
                              placeholder="Choose Field">
                        {
                          this.renderColSelection(this.state.responseBody['bar1'])
                        }
                      </Select>
                      {
                        this.renderCase2BarChart('bar1')
                      }
                    </div>
                  </div>
              </div>
            </Card>
            <Card title="转换后">
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                <SimpleTable data={{
                  table: this.state.responseBody['table2']['data'],
                  target: this.state.responseBody['table2']['field']
                }}/>
                <div className="right-charts">
                  <div style={{width: 300, height: 300}}>
                    <span style={{color: '#00AAAA'}}>{"查看转换后的数据分布"}</span>
                    <Select style={{width: 100, marginTop: 5, marginLeft: 20}}
                            onChange={(values) => this.setState({selectedColTwo: values})}
                            allowClear={false}
                            value={this.state.selectedColTwo}
                            placeholder="Choose Field">
                      {
                        this.renderColSelection(this.state.responseBody['bar2'])
                      }
                    </Select>
                    {
                      this.renderCase2BarChart('bar2')
                    }
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )

      case 3:
        return(
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{textAlign: 'center', marginBottom: 10}}>
              <h2>降维</h2>
            </div>
            <Card title="降维前后完整数据" style={{margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <div className="table_one">
                  <p>降维前</p>
                  <SimpleTable data={{
                    table: this.state.responseBody['table1']['data'],
                    target: this.state.responseBody['table1']['Y_fields']
                  }}/>
                </div>
                <div className={classnames(style.description)}>
                  <div>
                      <div style={{ marginBottom: 10}}>
                        <div style={{height: 20, width: 100, backgroundColor: '#C6DFB5'}}/>
                        <span>选做目标的栏位</span>
                      </div>
                    {
                      this.state.responseBody['general_info'].length !== 0 &&
                      this.state.responseBody['general_info'].map((e) =>
                        <div key={Object.keys(e)[0]}>
                          <span>{Object.keys(e)[0] + ': '}</span>
                          <Popover content={
                            <div>
                              <p style={{width: 100}}>{e[Object.keys(e)[0]]['description']}</p>
                            </div>
                          } title="Description">
                            <Icon type="question-circle-o" style={{fontSize: 10, marginLeft:3, color: '#767676'}}/>
                          </Popover>
                          <br/>
                          {
                            this.renderArray(e[Object.keys(e)[0]]['value'])
                          }
                        </div>
                      )
                    }
                  </div>
                </div>
                <div className="table_two" style={{width: 'auto'}}>
                  <p>降维后</p>
                  <SimpleTable data={{table: this.state.responseBody['table2']['data']}}/>
                </div>
              </div>
            </Card>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <Card title="降维前各栏位方差占比" className="pie_one" style={{width: '30%', margin: 5}}>
                <PieChart data={{'pie': this.state.responseBody['pie1']}} />
              </Card>
              <Card title="降维前后各栏位方差大小" className="bar_chart" style={{width: '40%', margin: 5}}>
                  <p>{"空白栏位用于分隔转换前和转换后数据"}</p>
                  <div style={{marginTop: -20}}>
                    <BarChart data={this.state.responseBody['bar']} type="dr"/>
                  </div>
              </Card>
              <Card title="降维后各栏位方差占比" className="pie_two" style={{width: '30%', margin: 5}}>
                <PieChart data={{'pie': this.state.responseBody['pie2']}} />
              </Card>
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
