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
          label="数据集名称"
        >
          {
            getFieldDecorator('data_set_name', {
              rules: [
                { required: true, message: '请输入名称' },
              ],
            })(<Input />)
          }
        </FormItem>
        <FormItem
          label="是否私有"
          hasFeedback
        >
          {getFieldDecorator('is_private', {
            rules: [
              { required: true, message: '请选择文件是否私有' },
            ],
          })(
            <Select placeholder="请选择文件是否私有">
              <Option value="true">是</Option>
              <Option value="false">否</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="描述"
        >
          {
            getFieldDecorator('ds_description', {
              initialValue: name,
              rules: [
                { required: true, message: '请输入描述' },
              ],
            })(<Input />)
          }
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 6 }}
        >
          <Button type="primary" htmlType="submit">Submit</Button>
        </FormItem>
      </Form>
    )
  }

ImportPanel.propTypes = {
  upload: PropTypes.object,
}

export default connect(({ upload }) => ({ upload }))(Form.create()(ImportPanel))
