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
        <h2>gRPC Connection Info</h2>
        <br/>
        <div className='flex-row'>
          <h3 style={{width: 35}}>IP:</h3>
          <Highlight className='python hljs code-container inline-code-container'>
            122.224.116.44
          </Highlight>
        </div>
        <br/>
        <div className='flex-row'>
          <h3 style={{width: 35}}>Port: </h3>
          <Highlight className='python hljs code-container inline-code-container'>
            9000
          </Highlight>
        </div>
        <br/>
        <h3>Example:</h3>
        <Tabs defaultActiveKey="1" size="small" className='code-tabs'>
          <TabPane tab="Python" key="1">
            <Highlight className='python hljs code-container'>
              {'from grpc.beta import implementations\n' +
              'import tensorflow as tf\n\n' +

              'from tensorflow_serving.apis import predict_pb2\n' +
              'from tensorflow_serving.apis import prediction_service_pb2\n\n' +

              'tf.app.flags.DEFINE_string(\'server\', \'localhost:9000\',\n' +
              '\'PredictionService host:port\')\n' +
              'tf.app.flags.DEFINE_string(\'image\', \'\', \'path to image in JPEG format\')\n\n' +

              'FLAGS = tf.app.flags.FLAGS\n\n' +

              'def main(_):\n' +
              '\thost, port = FLAGS.server.split(\':\')\n' +
              '\tchannel = implementations.insecure_channel(host, int(port))\n' +
              '\tstub = prediction_service_pb2.beta_create_PredictionService_stub(channel)\n\n' +

              '\t# Send request\n' +
              '\twith open(FLAGS.image, \'rb\') as f:\n\n' +

              '\t\t# See prediction_service.proto for gRPC request/response details.\n' +
              '\t\tdata = f.read()\n' +
              '\t\trequest = predict_pb2.PredictRequest()\n' +
              '\t\trequest.model_spec.name = \'inception\'\n' +
              '\t\trequest.model_spec.signature_name = \'predict_images\'\n' +
              '\t\trequest.inputs[\'images\'].CopyFrom(\n' +
              '\t\ttf.contrib.util.make_tensor_proto(data, shape=[1]))\n' +
              '\t\tresult = stub.Predict(request, 10.0)  # 10 secs timeout\n' +
              '\t\tprint(result)\n\n' +

              'if __name__ == \'__main__\':\n' +
              'tf.app.run()'}
            </Highlight>
          </TabPane>
          <TabPane tab="JavaScript" disabled key="2">Content of tab 2</TabPane>
          <TabPane tab="Java" disabled key="3">Content of tab 3</TabPane>
        </Tabs>
        <br/>
        <h3>Model Signature:</h3>
        <Tabs defaultActiveKey="1" size="small" className='code-tabs'>
          <TabPane tab="Python" key="1">
            <Highlight className='python hljs code-container'>
              {'predict_inputs_tensor_info = tf.saved_model.utils.build_tensor_info(jpegs)\n'+
                "prediction_signature = (\n"+
                "tf.saved_model.signature_def_utils.build_signature_def(\n"+
                "inputs={'images': predict_inputs_tensor_info},\n"+
                "outputs={\n"+
                "\t'classes': classes_output_tensor_info,\n"+
                "\t'scores': scores_output_tensor_info\n"+
              "},\n"+
               "method_name=tf.saved_model.signature_constants.PREDICT_METHOD_NAME\n"+
                "))\n\n"+

               "builder.add_meta_graph_and_variables(\n"+
                "sess, [tf.saved_model.tag_constants.SERVING],\n"+
                "signature_def_map={\n"+
                "\t'predict_images': prediction_signature,\n"+
                "\ttf.saved_model.signature_constants.DEFAULT_SERVING_SIGNATURE_DEF_KEY: classification_signature,\n"+
              "},\n"+
                'legacy_init_op=legacy_init_op)'}
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
