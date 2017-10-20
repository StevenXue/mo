import React from 'react'
import { Form, Input, Select, Upload, Button, Icon } from 'antd'
import { connect } from 'dva'
import styles from './index.css'

import { dataCategory } from '../../constants'

const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 7 },
};
function UploadData({ location }) {
  return (
    <div>
      <div className={styles.head}>
        Upload your file
      </div>

      <Form>
        <FormItem
          { ...formItemLayout }
          label='File name'
        >
          <Input />
        </FormItem>
        <FormItem
          { ...formItemLayout }
          label='Description'
        >
          <Input.TextArea />
        </FormItem>
        <FormItem
          { ...formItemLayout }
          label='Category'
        >
          <Select>
            {
              dataCategory.map(e => <Option key={e} value={e.toLowerCase()}>{e}</Option>)
            }
          </Select>
        </FormItem>
        <FormItem
          { ...formItemLayout }
          label='Tags'
        >
        </FormItem>
        <FormItem
          {...formItemLayout }
          label='Upload'
        >
          <Upload>
            <Button>
              <Icon type="upload"/> choose file
            </Button>
          </Upload>
        </FormItem>

        <FormItem
          wrapperCol={{ span: 12, offset: 2 }}
        >
          <Button type="primary" htmlType="submit">Submit</Button>
        </FormItem>
      </Form>
    </div>
  )
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(Form.create()(UploadData))
