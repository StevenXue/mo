/**
 * Created by zhaofengli on 02/06/2017.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import lodash from 'lodash'
import { Form, Input, Button, Upload, Icon, Select, Tag, Tooltip } from 'antd'
import Output from '../../../display-area/src/output'

const FormItem = Form.Item;
const Option = Select.Option;

let fields = ['Business', 'Government', 'Education', 'Environment', 'Health', 'Housing & Development', 'Public Services',
'Social', 'Transportation', 'Science', 'Technology'];
let tasks = ['Classification', 'Regression', 'Clustering', 'General Neural Network']

const ImportPanel =
  ({
     dispatch,
     //props,
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
          //console.log(values);
          let value = lodash.cloneDeep(values);
          value.tags = upload.tags;
          console.log(value);
          dispatch({ type: 'upload/importData', payload: value })
        } else {
          console.log('error', err);
        }
      });
    }

    function handleClose(removedTag){
      const tags = upload.tags.filter(tag => tag !== removedTag);
      console.log(tags);
      dispatch({type: 'upload/removeTag', payload: tags});
    }

    function showInput() {
      //this.setState({ inputVisible: true },);
      dispatch({ type: 'upload/showInput' })
    }

    function handleInputChange (e) {
      //this.setState({ inputValue: e.target.value });
      dispatch({ type: 'upload/setInputValue', payload: e.target.value })
    }

    function handleInputConfirm () {
      if(upload.inputValue && upload.tags.indexOf(upload.inputValue) === -1) {
        dispatch({ type: 'upload/confirmInput'})
      }
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
          extra="Column names for data, please split by ','"
        >
          {
            getFieldDecorator('names', {
            })(<Input />)
          }
        </FormItem>
        <FormItem
          label="Fields"
        >
          {getFieldDecorator('related_field', {
            rules: [
              { required: false},
            ],
          })(
            <Select >
              {
                fields.map((e) => <Option value={e} key={e}>{e}</Option>)
              }
            </Select>
          )}
        </FormItem>
        <FormItem
          label="Related Tasks"
        >
          {getFieldDecorator('related_tasks', {
            rules: [
              { required: false},
            ],
          })(
            <Select mode="multiple">
              {
                tasks.map((e) => <Option value={e} key={e}>{e}</Option>)
              }
            </Select>
          )}
        </FormItem>
        <FormItem
          label="Tags"
        >
          {
            getFieldDecorator('tags', {
            rules: [
              { required: false },
            ],
          })(
            <div>
              {upload.tags.length !== 0 && upload.tags.map((tag, index) => {
                const isLongTag = tag.length > 20;
                const tagElem = (
                  <Tag key={tag} closable={true} afterClose={() => handleClose(tag)}>
                    {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                  </Tag>
                );
                return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
              })}
              {upload.inputVisible && (
                <Input
                  //ref={input => this.input = input}
                  type="text"
                  size="small"
                  style={{ width: 78 }}
                  value={upload.inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                />
              )}
              {!upload.inputVisible && <Button size="small" type="dashed" onClick={showInput}>+ New Tag</Button>}
            </div>
          )}
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
