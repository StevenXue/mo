import {Form, Icon, Input, Button} from 'antd';
import React from 'react';
import {connect} from 'dva';

const FormItem = Form.Item;
import styles from './predictForm.less';

const {TextArea} = Input;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class GetPredictionForm extends React.Component {
  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  };

  get_prediction = (values) => {
    this.props.dispatch({
      type: 'deployment/getPrediction',
      payload: {
        input_value: JSON.parse(values['get_prediction_input']),
      }
    })
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.get_prediction(values);
      }
    })
  };

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;

    // Only show error after a field is touched.
    const inputError = isFieldTouched('get_prediction_input') && getFieldError('get_prediction_input');
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <FormItem
          validateStatus={inputError ? 'error' : ''}
          help={inputError || ''}
        >
          {getFieldDecorator('get_prediction_input', {
            rules: [{required: true, message: 'Please input your data!'}],
          })(
            <TextArea className={styles.inputtext}   style={{  height: '236px',
              width: '784px'}}
             placeholder=""/>
          )}
        </FormItem>
        <FormItem>
          <div style={{alignItems: 'center'}}>
            <Button
              type="primary"
              htmlType="submit"
              style={{margin: 10}}
              disabled={hasErrors(getFieldsError())}
            >
              Run
            </Button>
          </div>
        </FormItem>
      </Form>
    );
  }
}

const WrappedGetPredictionForm = Form.create()(GetPredictionForm);
connect(({deployment}) => ({deployment}))(WrappedGetPredictionForm);
export default WrappedGetPredictionForm


