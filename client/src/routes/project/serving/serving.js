import React from 'react'
import { connect } from 'dva'
import Highlight from 'react-highlight'
import { Tabs } from 'antd'
import './serving.less'

const TabPane = Tabs.TabPane

class Serving extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
  }

  render () {
    return (
      <div className="serving-container">
        <Tabs defaultActiveKey="1" size="small" className='code-tabs'>
          <TabPane tab="Python" key="1">
            <Highlight className='python hljs code-container'>
              {'def do_inference(hostport, work_dir, concurrency, num_tests):\n' +
              '  test_data_set = mnist_input_data.read_data_sets(work_dir).test\n' +
              '  host, port = hostport.split(\':\')\n' +
              '  for _ in range(num_tests):\n' +
              '    request = predict_pb2.PredictRequest()\n' +
              '    request.model_spec.name = \'mnist\'\n' +
              '    request.model_spec.signature_name = \'predict_images\'\n' +
              '    image, label = test_data_set.next_batch(1)\n' +
              '  return result_counter.get_error_rate()'}
            </Highlight>
          </TabPane>
          <TabPane tab="JavaScript" disabled key="2">Content of tab 2</TabPane>
          <TabPane tab="Java" disabled key="3">Content of tab 3</TabPane>
        </Tabs>

      </div>
    )
  }
}

Serving.PropTypes = {}

export default connect(({ project }) => ({ project }))(Serving)
