import React from 'react'
import styles from './index.less'
import {connect} from 'dva'
import {get, isEqual} from 'lodash'
import {Select, Collapse, Button, Input, Progress, Icon, Tooltip} from 'antd'
import ToolBar from './ToolBar/index'
import ParamsMapper from '../../../../../../components/ParamsMapper/index'
import LayerCard from '../../../../modelling/LayerCard/index'
import {format, unifyType} from '../../../../../../utils/base'
import {translateDict} from '../../../../../../constants'

const Option = Select.Option
const Panel = Collapse.Panel

function FakePanel({children, header, headerClass, isActive, prefixCls, destroyInactivePanel, openAnimation, onItemClick}) {
  return (
    <div>
      {children}
    </div>
  )
}

function getArgs(baseSteps, stepIndex, argIndex) {

  if (argIndex !== undefined) {
    return baseSteps[stepIndex].args[argIndex]
  } else {
    return baseSteps[stepIndex]
  }

}


function WorkBench({section, model, dispatch, namespace, preview}) {
  //state
  const {
    sectionsJson,
    mouseOverField,
  } = model

  const {
    stagingDataList,
  } = preview

  function handleBlur() {
    console.log('blur')
  }

  function handleFocus() {
    console.log('focus')
  }

  const {
    _id: sectionId,
    steps,
    percent,
    active_steps,
    [translateDict[namespace]]: {
      steps: baseSteps,
    },
  } = section

  //functions 下拉框选择
  function handleChange(value, index, argIndex) {
    // section.steps[index].args[argIndex].values = [value]; 备选方案以后再加相应的reducer

    sectionsJson[section._id].steps[index].args[argIndex].value = value

    dispatch({
      type: namespace + '/setSections',
      payload: {sectionsJson: sectionsJson},
    })
    // 将预览设置
  }

  function handleNext(stagingDatasetId, stepIndex, argIndex) {
    dispatch({
      type: namespace + '/getFields',
      payload: {
        stagingDatasetId,
        sectionId: section._id,
        stepIndex,
        argIndex,
        namespace,
      },
    })
    // let activeKey=active_steps;
    dispatch({
      type: namespace + '/setActiveKey',
      payload: {
        activeKey: [String(stepIndex + 1)],
        sectionId: section._id,
      },
    })
  }

  function callback(key) {
    dispatch({
      type: namespace + '/setActiveKey',
      payload: {
        activeKey: key,
        sectionId: section._id,
      },
    })
  }

  function handleClickField(fieldName, stepIndex, argIndex, datasourceStepIndex) {
    dispatch({
      type: namespace + '/addRemoveField',
      payload: {
        stepIndex,
        argIndex,
        fieldName,
        sectionId: section._id,
        datasourceStepIndex,
      },
    })
  }

  function handleMouseOverField(fieldName) {
    dispatch({
      type: namespace + '/addMouseOverField',
      payload: {
        fieldName,
        sectionId: section._id,
      },
    })
  }

  function handleMouseLeaveField() {
    dispatch({
      type: namespace + '/removeMouseOverField',
    })
  }

  function handleOnChangeArgs(e, stepIndex, argIndex) {
    e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    dispatch({
      type: namespace + '/setParameter',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value: e,
      },
    })
  }

  function setValue(value, stepIndex, argIndex) {
    dispatch({
      type: namespace + '/setValue',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value,
      },
    })
  }

  function addValue(value, stepIndex, argIndex, valueIndex) {
    // e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    dispatch({
      type: namespace + '/addValue',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value,
        valueIndex,
      },
    })
  }

  function deleteValue(value, stepIndex, argIndex, valueIndex) {

    // e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    dispatch({
      type: namespace + '/deleteValue',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        valueIndex,
      },
    })
  }

  function updateLayerArgs(value, stepIndex, argIndex, valueIndex) {
    // e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    dispatch({
      type: namespace + '/updateLayerArgs',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value,
        valueIndex,
      },
    })
  }

  function setLayerDefault(value, stepIndex, argIndex, valueIndex) {
    // e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    for (let key in value) {
      let idx = sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex].args.findIndex(e => e.name === key)
      if (!isEqual(sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex].args[idx].default, value[key])) {
        dispatch({
          type: namespace + '/setLayerDefault',
          payload: {
            sectionId: section._id,
            stepIndex,
            argIndex,
            value,
            valueIndex,
          },
        })
        return
      }
    }
  }

  function setValueDefault(value, stepIndex, argIndex, valueIndex) {
    for (let key in value) {
      let idx = sectionsJson[sectionId].steps[stepIndex].args.findIndex(e => e.name === key)
      if (!isEqual(sectionsJson[sectionId].steps[stepIndex].args[idx].default, value[key])) {
        dispatch({
          type: namespace + '/setDefault',
          payload: {
            sectionId: section._id,
            stepIndex,
            argIndex,
            value,
            valueIndex,
          },
        })
        return
      }
    }
  }

  function setValueOfValues(e, stepIndex, argIndex, valueIndex) {
    // e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    dispatch({
      type: namespace + '/setValueOfValues',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value: e,
        valueIndex,
      },
    })
  }

  function updateValueOfValues(e, stepIndex, argIndex, valueIndex) {
    // e = format(e, baseSteps[stepIndex].args[argIndex]['value_type'])
    dispatch({
      type: namespace + '/updateValueOfValues',
      payload: {
        sectionId: section._id,
        stepIndex,
        argIndex,
        value: e,
        valueIndex,
      },
    })
  }

  function renderFields(steps, step, stepIndex) {
    // 检验长度
    let len_range = baseSteps[stepIndex].args[0].len_range
    let value_length = step.args[0].values.length
    let warningText = null

    if (len_range) {
      if (len_range[0]) {
        if (value_length < len_range[0]) {
          warningText = `you have select ${value_length} fields, less than required ${len_range[0]}`
        }
      }
      if (len_range[1]) {
        if (value_length > len_range[1]) {
          warningText = `you have select ${value_length} fields, more than required ${len_range[1]}`
        }
      }
    }

    // 检验数值类型

    return [
      renderPanel(fieldSelector(steps[0], 0, step, stepIndex), stepIndex,
        <div className={styles.panel_title_hint}>
          {warningText}
        </div>),
      renderFakePanel(step, stepIndex,
        step.args[0].values.length ?
          `You have select ${step.args[0].values.length} fields`
          : 'You have not select any fields'
      )
    ]
  }

  // 以后将render fields 更改为pro， 可以根据提供的range字段获得该step需要的datasource
  function renderFieldsPro(steps, step, stepIndex) {
    let len_range = baseSteps[stepIndex].args[0].len_range
    let value_length = step.args[0].values.length
    let warningText = null

    if (len_range) {
      if (len_range[0]) {
        if (value_length < len_range[0]) {
          warningText = `you have select ${value_length} fields, less than required ${len_range[0]}`
        }
      }
      if (len_range[1]) {
        if (value_length > len_range[1]) {
          warningText = `you have select ${value_length} fields, more than required ${len_range[1]}`
        }
      }
    }

    let range = baseSteps[stepIndex].args[0].range
    let dataSourceStepIndex
    if (range.hasOwnProperty('type')) {
      dataSourceStepIndex = range.step_index
    }

    return [
      renderPanel(fieldSelector(steps[dataSourceStepIndex], 0, step, stepIndex), stepIndex,
        <div className={styles.panel_title_hint}>
          {warningText}
        </div>),


      renderFakePanel(step, stepIndex,
        step.args[0].values.length ?
          `You have select ${step.args[0].values.length} fields`
          : 'You have not select any fields'
      )
    ]
  }


  function fieldSelector(datasourceStep, datasourceStepIndex, step, stepIndex) {
    return (
      <div>
        <div className={styles.fields}>

          {
            step.args.map((arg, argIndex) => {
              const values = arg.values

              let fields = get(datasourceStep, `args[${argIndex}].fields`, [])
              let fieldsJson = get(datasourceStep, `args[${argIndex}].fieldsJson`, {})
              return fields.map((field) => {
                const fieldName = field[0]
                const fieldType = unifyType(field[1][0])
                let disable;
                const requiredFieldTypes = baseSteps[stepIndex]['args'][argIndex]['value_type']
                if(requiredFieldTypes){
                  if(!requiredFieldTypes.includes(fieldType)){
                    disable = true
                  }
                }

                let backgroundColor
                let onClick
                let className

                if (fieldsJson[fieldName]) {
                  if (values.includes(fieldName)) {
                    // blue onclick
                    backgroundColor = '#34C0E2'
                    onClick = true
                    className = styles.active_field
                  }
                  else {
                    //black
                    backgroundColor = 'black'
                    onClick = false
                    className = styles.disable_field
                  }
                } else {
                  if (values.includes(fieldName)) {
                    // blue onclick
                    backgroundColor = '#34C0E2'
                    onClick = true
                    className = styles.active_field

                  }
                  else {
                    //grey onclick
                    backgroundColor = '#F3F3F3'
                    onClick = true
                    className = styles.field

                  }
                }

                if(disable){
                  onClick = false
                  className = styles.disable_field
                }

                return (
                  <div key={fieldName}
                       className={`${styles.field} ${className}`}
                       onClick={onClick ? () => handleClickField(fieldName, stepIndex, argIndex, datasourceStepIndex) : null}
                       style={{
                         // backgroundColor: backgroundColor,
                         color: mouseOverField === fieldName ? 'green' : 'grey',
                       }}
                       onMouseOver={() => handleMouseOverField(fieldName)}
                       onMouseLeave={() => handleMouseLeaveField()}>
                    <p style={{
                      // backgroundColor: backgroundColor,
                      color: values.includes(fieldName) ? 'white' : 'grey',
                    }}
                       className={styles.text}
                    >{fieldName}</p>
                  </div>
                )

              })
            })
          }
        </div>
        <div className={styles.end_button}>
          {
            LastOrRunButton(stepIndex, stepLength)
          }
        </div>
      </div>
    )
  }


  function getTitle(valueIndex, length) {
    if (valueIndex === 0) {
      return 'Input Layer'
    } else if (valueIndex === length - 1) {
      return 'Output Layer'
    } else {
      return `Hidden Layer ${valueIndex}`
    }
  }

  function networkBuilder(step, stepIndex, featureFields, labelFields) {
    return (
      <div>
        {step.args.map((arg, argIndex) => {
          const values = step.args[argIndex].values
          return (
            <div key={argIndex}>
              {
                values.map((value, valueIdx) =>
                  <LayerCard
                    title={getTitle(valueIdx, values.length)}
                    key={'layercard' + valueIdx}
                    layerIndex={valueIdx}
                    argIndex={argIndex}
                    arg={arg}
                    baseValue={baseSteps[stepIndex].args[argIndex].range.find(e => e.name === value['name'])}
                    featureFields={featureFields}
                    labelFields={labelFields}
                    {...{model, dispatch, namespace, stepIndex, argIndex, valueIdx}}
                    funcs={{
                      addValue: (e) => addValue(e, stepIndex, argIndex, valueIdx),
                      deleteValue: (e) => deleteValue(e, stepIndex, argIndex, valueIdx),
                      updateValueOfValues: (e) => updateValueOfValues(e, stepIndex, argIndex, valueIdx),
                      updateLayerArgs: (e) => updateLayerArgs(e, stepIndex, argIndex, valueIdx),
                      setLayerDefault: (e) => setLayerDefault(e, stepIndex, argIndex, valueIdx),
                    }}
                  />,
                )
              }
              <div className={styles.end_button}>
                <Button type="primary" className={styles.button} onClick={() =>
                  dispatch({
                    type: namespace + '/setActiveKey',
                    payload: {
                      activeKey: [String(stepIndex), String(stepIndex + 1)],
                      sectionId: section._id,
                    },
                  })}>next</Button>
              </div>
            </div>)
        })}
      </div>
    )
  }

  function renderParameters(step, stepIndex) {
    return (
      <div>
        <ParamsMapper args={step.args}
                      setValue={(value, argIndex) => setValue(value, stepIndex, argIndex)}
                      setValueDefault={(value) => setValueDefault(value, stepIndex)}
                      baseArgs={baseSteps[stepIndex].args}
                      {...{stepIndex}}
        />
        <div className={styles.end_button}>
          {
            LastOrRunButton(stepIndex, stepLength)
          }
        </div>
      </div>
    )
  }

  function LastOrRunButton(stepIndex, stepLength) {
    if (stepIndex !== stepLength - 1) {
      return (
        <Button type="primary" className={styles.button}
                onClick={() => {
                  dispatch({
                    type: namespace + '/setActiveKey',
                    payload: {
                      activeKey: [String(stepIndex + 1)],
                      sectionId: section._id,
                    },
                  })
                }}>
          next
        </Button>
      )
    } else {
      return (
        <Button type="primary" className={styles.button}
                onClick={() => {
                  dispatch({
                    type: namespace + '/runSection',
                    payload: {
                      sectionId,
                      namespace,
                    },
                  })
                  dispatch({
                    type: namespace + '/setActiveKey',
                    payload: {
                      activeKey: [],
                      sectionId: section._id,
                    },
                  })
                }}>
          run
        </Button>
      )
    }
  }

  const stepLength = steps.length

  function renderDataSource(step, stepIndex) {
    let ret = [
      renderPanel(dataSource(step.args, stepIndex), stepIndex),
    ]
    if (!active_steps.includes(stepIndex.toString())) {
      ret.push(
        <FakePanel key={stepIndex + step.name + 'hint'}>
          <div className={styles.fake_panel_container}>
            <div className={styles.fake_panel}>
              {step.args[0].value ? 'You have select 1 data' : 'You have not select any data'}
            </div>
          </div>
        </FakePanel>)
    }
    return ret
  }

  function dataSource(args, stepIndex) {
    return (
      args.map((arg, argIndex) =>
        <div key={arg.name + argIndex}>
          <Select
            key={arg.name + argIndex}
            className={styles.select}
            showSearch
            style={{width: 200}}
            placeholder="Select a stagingData"
            optionFilterProp="children"
            onChange={(value) => handleChange(value, stepIndex, argIndex)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            defaultValue={arg.value}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {stagingDataList.map((stagingData) =>
              <Option key={stagingData._id} value={stagingData._id}>{stagingData.name}</Option>,
            )}
          </Select>

          {
            <Button type="primary"
                    onClick={() => handleNext(arg.value, stepIndex, argIndex)}
                    className={styles.button}>
              next
            </Button>
          }
        </div>,
      )
    )
  }

  // function setting(args, stepIndex) {
  //   return (
  //     args.map((arg, argIndex) => {
  //
  //     })
  //   )
  // }

  function parameters(step, stepIndex) {
    return (
      <div>
        <ParamsMapper args={step.args} setValue={(value, argIndex) => setValue(value, stepIndex, argIndex)}/>
        <div className={styles.end_button}>
          {
            LastOrRunButton(stepIndex, stepLength)
          }
        </div>
      </div>
    )
    // return (
    //   <div>
    //     {
    //       step.args.map((arg, argIndex) =>
    //         <div className={styles.pair} key={arg.name + argIndex}>
    //                           <span>
    //                             {getArgs(baseSteps, stepIndex, argIndex).display_name}
    //                           </span>
    //           <div className={styles.row}>
    //             <Input placeholder="" defaultValue={arg.value}
    //                    onChange={(e) => handleOnChangeArgs(e.target.value, stepIndex, argIndex)}/>
    //             <div className={styles.help}>
    //               <Tooltip title={getArgs(baseSteps, stepIndex, argIndex).des}>
    //                 <Icon type="question-circle-o"/>
    //               </Tooltip>
    //             </div>
    //
    //           </div>
    //         </div>,
    //       )
    //     }
    //     <div className={styles.end_button}>
    //       {
    //         LastOrRunButton(stepIndex, stepLength)
    //       }
    //     </div>
    //   </div>
    // )
  }

  function renderFakePanel(step, stepIndex, text) {
    return (
      !active_steps.includes(stepIndex.toString()) ? <FakePanel key={stepIndex + step.name + 'hint'}>
        <div className={styles.fake_panel_container}>
          <div className={styles.fake_panel}>
            {text}
          </div>
        </div>
      </FakePanel> : null
    )
  }

  function renderPanel(child, stepIndex, headerChild = null) {
    return <Panel
      header={
        (
          <div className={styles.panel_title_row}>
            <div className={styles.panel_title}>
              {getArgs(baseSteps, stepIndex).display_name}

              {getArgs(baseSteps, stepIndex).des?
                <div className={styles.help}>
                  <Tooltip title={getArgs(baseSteps, stepIndex).des}>
                    <Icon type="question-circle-o"/>
                  </Tooltip>
                </div>
                :null}

            </div>

            {headerChild}
          </div>)
      }
      key={stepIndex}
      className={styles.panel}>
      {child}
    </Panel>
  }

  return (
    <div>
      <ToolBar sectionId={sectionId} {...{model, dispatch, namespace}}/>
      {
        namespace === 'modelling' &&
        <div style={{width: '97%', margin: 'auto'}}>
          <Progress percent={percent}/>
        </div>
      }
      <div className={`${styles.container} my-collapse-arrow`}>
        <Collapse className={styles.collapse}
                  defaultActiveKey={['data_source']} onChange={callback}
                  activeKey={active_steps}>
          {
            steps.map((step, stepIndex) => {
                switch (step.name) {
                  case 'data_source':
                  case 'target_datasource':
                  case 'from_datasource':
                    return renderDataSource(step, stepIndex)
                  case 'fields':
                  case 'feature_fields':
                  case 'label_fields':
                    return renderFields(steps, step, stepIndex)
                  //等把后端的 fields的range更换为从某step取值后，将fields更换
                  case 'from_fields':
                  case 'select_index':
                    return renderFieldsPro(steps, step, stepIndex)
                  case 'layers':
                    let numOfLayer = 2
                    return [
                      renderPanel(
                        networkBuilder(step, stepIndex, steps[1].args[0].values, steps[2].args[0].values),
                        stepIndex),
                      renderFakePanel(step, stepIndex,
                        numOfLayer !== 2 ? `You have added ${numOfLayer} layers`
                          : 'You have not added any layers',
                      ),
                    ]
                  case 'estimator':
                  case 'compile':
                  case 'fit':
                  case 'setting':
                  case 'evaluate':
                  case 'hyperparameters':
                  case 'parameters':
                    // num of args filled
                    let numArgsFill = 0
                    step.args.forEach((arg) => {
                      if (arg.value) {
                        numArgsFill += 1
                      }
                    })
                    return [
                      renderPanel(renderParameters(step, stepIndex), stepIndex),
                      renderFakePanel(step, stepIndex,
                        numArgsFill ? `You have filled ${numArgsFill} args`
                          : 'You have not filled any args',
                      ),
                    ]
                }
              },
            )
          }
        </Collapse>
      </div>
    </div>
  )
}

export default connect(({preview}) => ({preview}))(WorkBench)
