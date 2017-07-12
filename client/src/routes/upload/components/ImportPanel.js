/**
 * Created by zhaofengli on 02/06/2017.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Form, Input, Button, Upload, Icon, Select } from 'antd'

const FormItem = Form.Item;
const Option = Select.Option;

const ImportPanel =
  ({
     dispatch,
     upload,
     form: {
       getFieldDecorator,
       getFieldsValue,
       setFieldsValue,
       validateFields,
     }
   }) => {

    function okHandler(e) {
      e.preventDefault();
      validateFields((err, values) => {
        if (!err) {
          dispatch({ type: 'upload/importData', payload: values })
        } else {
          console.log('error', err);
        }
      });
    }

    return (
      <Form layout='horizontal'  onSubmit={(e) => okHandler(e)}>
        <FormItem
          label="Name"
        >
          {
            getFieldDecorator('data_set_name', {
              rules: [
                { required: true, message: 'please import name' },
              ],
            })(<Input />)
          }
        </FormItem>
        <FormItem
          label="Description"
        >
          {
            getFieldDecorator('ds_description', {
              initialValue: name,
              rules: [
                { required: true, message: 'please input description' },
              ],
            })(<Input />)
          }
        </FormItem>
        <FormItem
          label="Privacy"
          hasFeedback
        >
          {getFieldDecorator('is_private', {
            initialValue: 'false',
            rules: [
              { required: true, message: '请选择文件是否私有' },
            ],
          })(
            <Select >
              <Option value="false">public</Option>
              <Option value="true">private</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="Columns"
        >
          {
            getFieldDecorator('names', {
            })(<Input />)
          }
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 0 }}
        >

          <Button type="primary" htmlType="submit">Submit</Button>
          <Button type="default" style={{marginLeft: 10}}
                  onClick={() => dispatch({ type: 'upload/hideImportPanel'})}>Cancel</Button>

        </FormItem>
      </Form>
    )
  }

ImportPanel.propTypes = {
  upload: PropTypes.object,
}

export default connect(({ upload }) => ({ upload }))(Form.create()(ImportPanel))
