import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import Model from './modelProcess.js'
import { Button, Select, Spin, Tag } from 'antd'
import { assetsUrl, flaskServer, stepStyle } from '../../../constants'
import { TourArea } from '../../../components'

const steps = [
  {
    title: 'Choose Dataset for Modelling',
    text: 'Click to choose your data set to use as input of model',
    selector: '.modelling_dataset',
    position: 'top',
    isFixed: true,
    style: stepStyle,
  },
  {
    title: 'Choose Model and Input',
    text: 'Choose the model you want to training, and choose the input columns',
    selector: '.choose_model_and_input',
    position: 'top',
    isFixed: true,
    style: stepStyle,
  },
  {
    title: 'Choose Parameters',
    text: <TourArea
      text='Choose the parameters for modelling'
      src={assetsUrl + '/videos/modelling.mp4'}/>,
    selector: '.choose_params',
    position: 'top',
    isFixed: true,
    style: stepStyle,
  },
]

class AutomatedModel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data_set: [],
      selectedData: '',
      selectedDataName: '',
      tags: [],
      // cols: 0,
      // row: 0,
      field: '',
      tasks: [],
      loading: true,
      statusStack: [],
      columns: [],
      selectedFile: '',
      params: [],

    }
  }

  componentDidMount () {
    this.props.dispatch({ type: 'project/listFiles', payload: { extension: 'zip' } })

    fetch(flaskServer + '/project/jobs/' + this.props.project_id + '?categories=model', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((res) => {
          let params = res.response.model
          // params = params.filter((e) => e.status === 200)
          // console.log(params);
          this.setState({ params })
          if (res.response.model.length === 0) {
            let statusStack = [true]
            this.setState({ statusStack })
          } else {
            let statusStack = []
            let l = params.length
            for (let i = 0; i < l; i++) {
              statusStack.push(false)
            }
            this.setState({ statusStack })
          }

          fetch(flaskServer + '/staging_data/staging_data_sets?without_result=true&project_id=' + this.props.project_id, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((response) => response.json())
            .then((res) =>
              this.setState({ data_set: res.response, loading: false }),
            )

        },
      )
  }

  addNewModel () {
    let array = this.state.statusStack
    array.push(true)
    this.setState({ statusStack: array })
  }

  onSelectFile (values) {
    this.setState({ selectedFile: values, selectedData: '', selectedDataName: '' })
  }

  onSelectDataSet (values) {
    let selected = this.state.data_set.filter((el) => el._id === values)
    let selectedName = selected[0].name
    this.setState({ selectedData: values, selectedDataName: selectedName, loading: true, selectedFile: '' })
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
            dataSetType: res.response.data_set_type,
            loading: false,
          })
          console.log(res.response)
          //let c = Object.keys(res.response.data[1])
          this.setState({ columns: res.response.columns, loading: false })
        },
      )
      .catch((err) => console.log('Error: /staging_data/staging_data_sets/fields', err))
  }

  deactivate (i) {
    let array = this.state.statusStack
    array[i] = false
    this.setState({ statusStack: array })
  }

  renderAddButton () {
    if (this.state.selectedData !== '' || this.state.selectedFile !== '') {
      return (
        <Button type='normal' size='small'
                disabled={this.props.project.isPublic}
                style={{ marginLeft: 10 }}
                onClick={() => this.addNewModel()}>
          Add New Section
        </Button>
      )
    }
  }

  render () {
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', overflowX: 'auto' }}>
          <div className='modelling_dataset' style={{
            width: '20%', marginTop: 10, marginLeft: 10, display: 'flex', height: '100%', flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{ color: '#108ee9' }}>Choose Source for modelling</span>
            <span style={{ float: 'left' }}>{'Choose Dataset:'}</span>
            <Select className="dataset-select"
                    style={{ width: '90%' }}
                    onChange={(values) => this.onSelectDataSet(values)}
                    value={this.state.selectedData}
                    placeholder="Choose DataSet"
                    allowClear>
              {
                this.props.project.stagingData.filter((e) => !('type' in e)).map((e) =>
                  <Select.Option value={e._id} key={e._id}>
                    {e.name}
                  </Select.Option>,
                )
              }
            </Select>
            {/*<span style={{float: 'left', marginTop: 10}}>{"Or Choose File:"}</span>*/}
            {/*<Select className="dataset-select"*/}
            {/*style={{width: '90%'}}*/}
            {/*onChange={(values) => this.onSelectFile(values)}*/}
            {/*value={this.state.selectedFile}*/}
            {/*placeholder="Choose DataSet"*/}
            {/*allowClear>*/}
            {/*{*/}
            {/*this.props.project.files &&*/}
            {/*this.props.project.files.map((e) =>*/}
            {/*<Select.Option value={e._id} key={e._id}>*/}
            {/*{e.name}*/}
            {/*</Select.Option>,*/}
            {/*)*/}
            {/*}*/}
            {/*</Select>*/}

            {this.state.selectedData &&
            <div style={{ marginTop: 15, marginLeft: 10, width: '90%' }}>
              <Spin spinning={this.state.loading}>
                <span style={{ color: '#108ee9' }}>Dataset Info</span>
                {this.state.cols !== undefined && this.state.cols > 0 &&
                <div>
                  <div>
                    <span>{'Number of Fields: '}</span>
                    <span style={{ color: '#00AAAA' }}>{this.state.cols}</span>
                  </div>
                  <div>
                    <span>{'Number of Records: '}</span>
                    <span style={{ color: '#00AAAA' }}>{this.state.row}</span>
                  </div>
                </div>
                }
                <div style={{ backgroundColor: '#49a9ee', height: 1, marginTop: 5, width: '80%' }}/>
                <div style={{ marginTop: 10 }}>
                  <span>{'Category: '}</span>
                  {this.state.field &&
                  <Tag style={{ margin: 5 }}>
                    {this.state.field}
                  </Tag>
                  }
                </div>
                <div style={{ marginTop: 10 }}>
                  <span>{'Tags: '}</span>
                  {
                    this.state.tags.map((e) =>
                      <Tag style={{ margin: 5 }} key={e}>
                        {e}
                      </Tag>,
                    )
                  }
                </div>
                <div style={{ marginTop: 10 }}>
                  <span>{'Related Tasks: '}</span>
                  {
                    this.state.tasks.map((e) =>
                      <Tag style={{ margin: 5 }} key={e}>
                        {e}
                      </Tag>,
                    )
                  }
                </div>
              </Spin>
            </div>
            }
          </div>
          <div style={{ width: 1, backgroundColor: '#EDEDED', height: 500 }}/>
          <div style={{
            width: '70%',
            marginLeft: 10,
            height: 500,
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, width: '100%' }}>
              <div style={{ marginLeft: 10 }}>
                <span>Models</span>
                {
                  this.renderAddButton()
                }
                <Button style={{ float: 'right', marginRight: 10 }}
                        shape="circle" icon="question" onClick={() => this.props.runTour(steps)}
                />
              </div>
              <div style={{ width: '100%', height: 1, backgroundColor: '#108ee9', margin: 5 }}/>
              <div style={{ height: 480, overflowY: 'auto', backgroundColor: '#fafafa' }}>
                {
                  this.state.statusStack.map((el, i) =>
                    <Model style={{ width: 1200, height: 450 }}
                           selectedFile={this.state.selectedFile}
                           project_id={this.props.project_id}
                           dataset_id={this.state.selectedData}
                           dataSetType={this.state.dataSetType}
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
  project_id: PropTypes.string,
}

export default connect(({ project }) => ({ project }))(AutomatedModel)
