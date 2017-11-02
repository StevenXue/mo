import React from 'react'
import styles from './index.less'
import {connect} from 'dva'

import {Select, Collapse, Button, Input, Popover, Icon, Tooltip} from 'antd'

const Option = Select.Option
const Panel = Collapse.Panel
import {get, isEqual} from 'lodash'

import ToolBar from './ToolBar/index'
import ParamsMapper from '../../../../../../components/ParamsMapper/index'
import LayerCard from '../../../../modelling/LayerCard/index'
import {format} from '../../../../../../utils/base'
import {translateDict} from '../../../../../../constants'


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

const content = (content) => (
  <div>
    <p>{content}</p>
  </div>
)

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
        datasourceStepIndex
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

  function fieldSelector(datasourceStep, datasourceStepIndex, step, stepIndex) {
    return (
      <div>
        <div className={styles.fields}>
          {
            step.args.map((arg, argIndex) => {
              const values = arg.values;

              let fields = get(datasourceStep, `args[${argIndex}].fields`, []);
              let fieldsJson = get(datasourceStep, `args[${argIndex}].fieldsJson`, {});
              return fields.map((field) => {
                const fieldName = field[0];

                let backgroundColor;
                let onClick;
                let className;

                if (fieldsJson[fieldName]) {
                  if (values.includes(fieldName)) {
                    // blue onclick
                    backgroundColor = '#34C0E2';
                    onClick = true;
                    className = styles.active_field
                  }
                  else {
                    //black
                    backgroundColor = 'black';
                    onClick = false;
                    className = styles.disable_field
                  }
                } else {
                  if (values.includes(fieldName)) {
                    // blue onclick
                    backgroundColor = '#34C0E2';
                    onClick = true;
                    className = styles.active_field

                  }
                  else {
                    //grey onclick
                    backgroundColor = '#F3F3F3';
                    onClick = true;
                    className = styles.field

                  }
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
                    <p className={styles.text}>{fieldName}</p>
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

  // function secondFieldSelector(datasourceStep, step, stepIndex, LastStep) {
  //   return (
  //     <div>
  //       <div className={styles.fields}>
  //         {
  //           step.args.map((arg, argIndex) => {
  //             const values = arg.values;
  //             const lastValues = LastStep.args[argIndex].values;
  //
  //             let fields = get(datasourceStep, `args[${argIndex}].fields`, []);
  //             return fields.map((field) => {
  //               const fieldName = field[0];
  //
  //               if (lastValues.includes(fieldName)) {
  //                 return (
  //                   <div key={fieldName}
  //                        className={styles.field}
  //                        style={{
  //                          backgroundColor: 'grey',
  //                          color: mouseOverField === fieldName ? 'green' : 'grey',
  //                        }}
  //                        onMouseOver={() => handleMouseOverField(fieldName)}
  //                        onMouseLeave={() => handleMouseLeaveField()}>
  //                     <p className={styles.text}>{fieldName}</p>
  //                   </div>
  //                 )
  //               }
  //
  //               return (
  //                 <div key={fieldName}
  //                      className={styles.field}
  //                      onClick={() => handleClickField(fieldName, stepIndex, argIndex)}
  //                      style={{
  //                        backgroundColor: values.includes(fieldName) ? '#34C0E2' : '#F3F3F3',
  //                        color: mouseOverField === fieldName ? 'green' : 'grey',
  //                      }}
  //                      onMouseOver={() => handleMouseOverField(fieldName)}
  //                      onMouseLeave={() => handleMouseLeaveField()}>
  //                   <p className={styles.text}>{fieldName}</p>
  //                 </div>
  //               )
  //
  //               // if(values.includes(fieldName)){
  //               //   return (
  //               //     <div key={fieldName}
  //               //          className={styles.field}
  //               //          onClick={() => handleClickField(fieldName, stepIndex, argIndex)}
  //               //          style={{
  //               //            backgroundColor: (arg.values).includes(fieldName) ? '#34C0E2' : '#F3F3F3',
  //               //            color: mouseOverField === fieldName ? 'green' : 'grey',
  //               //          }}
  //               //          onMouseOver={() => handleMouseOverField(fieldName)}
  //               //          onMouseLeave={() => handleMouseLeaveField()}>
  //               //       <p className={styles.text}>{fieldName}</p>
  //               //     </div>
  //               //   )
  //               // }
  //
  //
  //             })
  //           })
  //         }
  //       </div>
  //       <div className={styles.end_button}>
  //         {
  //           LastOrRunButton(stepIndex, stepLength)
  //         }
  //       </div>
  //     </div>)
  // }

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
                      addValue: (e) => addValue(e, stepIndex, argIndex, valueIdx + 1),
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

  function setting(args, stepIndex) {
    return (
      args.map((arg, argIndex) => {

      })
    )
  }

  // todo tooltip 还没加

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
    );
    return (
      <div>
        {
          step.args.map((arg, argIndex) =>
            <div className={styles.pair} key={arg.name + argIndex}>
                              <span>
                                {getArgs(baseSteps, stepIndex, argIndex).display_name}
                              </span>
              <div className={styles.row}>
                <Input placeholder="" defaultValue={arg.value}
                       onChange={(e) => handleOnChangeArgs(e.target.value, stepIndex, argIndex)}/>
                <div className={styles.help}>
                  <Tooltip title={getArgs(baseSteps, stepIndex, argIndex).des}>
                    <Icon type="question-circle-o"/>
                  </Tooltip>
                </div>

              </div>
            </div>,
          )
        }
        <div className={styles.end_button}>
          {
            LastOrRunButton(stepIndex, stepLength)
          }
        </div>
      </div>
    )
  }

  return (
    <div>
      <ToolBar sectionId={sectionId} {...{model, dispatch, namespace}}/>
      <div className={`${styles.container} my-collapse-arrow`}>
        <Collapse className={styles.collapse}
                  defaultActiveKey={['data_source']} onChange={callback}
                  activeKey={active_steps}>
          {
            steps.map((step, stepIndex) => {
                switch (step.name) {
                  case 'data_source':
                    let ret = [<Panel
                      className={styles.panel}
                      header={
                        (
                          <div className={styles.panel_title_row}>
                            {getArgs(baseSteps, stepIndex).display_name}
                          </div>)
                      }
                      key={stepIndex}
                    >
                      {dataSource(step.args, stepIndex)}
                    </Panel>
                    ];
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
                    return ret;
                  case 'fields':
                    return [
                      <Panel
                        header={
                          (
                            <div className={styles.panel_title_row}>
                              {getArgs(baseSteps, stepIndex).display_name}
                            </div>)
                        }
                        key={stepIndex}
                        className={styles.panel}
                      >
                        {fieldSelector(steps[0], 0, step, stepIndex)}
                      </Panel>,
                      !active_steps.includes(stepIndex.toString()) ?
                        <FakePanel key={stepIndex + step.name + 'hint'}>
                          <div className={styles.fake_panel_container}>
                            <div className={styles.fake_panel}>
                              {step.args[0].values.length ?
                                `You have select ${step.args[0].values.length} fields`
                                : 'You have not select any fields'}
                            </div>
                          </div>
                        </FakePanel> : null
                    ];
                  case 'feature_fields':
                    return [
                      <Panel
                        header={
                          (
                            <div className={styles.panel_title_row}>
                              {getArgs(baseSteps, stepIndex).display_name}
                            </div>)
                        }
                        key={stepIndex}
                        className={styles.panel}>
                        {fieldSelector(steps[0], 0, step, stepIndex)}
                      </Panel>,
                      !active_steps.includes(stepIndex.toString()) ?
                        <FakePanel key={stepIndex + step.name + 'hint'}>
                          <div className={styles.fake_panel_container}>
                            <div className={styles.fake_panel}>
                              {step.args[0].values.length ?
                                `You have select ${step.args[0].values.length} fields`
                                : 'You have not select any fields'}
                            </div>
                          </div>
                        </FakePanel> : null
                    ];
                  case 'label_fields':
                    return [
                      <Panel
                        header={
                          (
                            <div className={styles.panel_title_row}>
                              {getArgs(baseSteps, stepIndex).display_name}
                            </div>)
                        }
                        key={stepIndex}
                        className={styles.panel}>
                        {fieldSelector(steps[0], 0, step, stepIndex)}
                      </Panel>,
                      !active_steps.includes(stepIndex.toString()) ?
                        <FakePanel key={stepIndex + step.name + 'hint'}>
                          <div className={styles.fake_panel_container}>
                            <div className={styles.fake_panel}>
                              {step.args[0].values.length ?
                                `You have select ${step.args[0].values.length} fields`
                                : 'You have not select any fields'}
                            </div>
                          </div>
                        </FakePanel> : null
                    ];
                  case 'parameters':
                    // num of args filled
                    let numArgsFill = 0;
                    step.args.forEach((arg)=>{
                      console.log("arg", arg)
                      if(arg.value){
                        console.log("add")

                        numArgsFill+=1
                      }
                    });
                    return [
                      <Panel
                        header={
                          (
                            <div className={styles.panel_title_row}>
                              {getArgs(baseSteps, stepIndex).display_name}
                            </div>)
                        }
                        key={stepIndex}
                        className={styles.panel}>
                        {renderParameters(step, stepIndex)}
                      </Panel>,
                      !active_steps.includes(stepIndex.toString()) ?
                        <FakePanel key={stepIndex + step.name + 'hint'}>
                          <div className={styles.fake_panel_container}>
                            <div className={styles.fake_panel}>
                              {numArgsFill ?
                                `You have filled ${numArgsFill} args`
                                : 'You have not fill any args'}
                            </div>
                          </div>
                        </FakePanel> : null
                    ];
                  case 'layers':
                    return (
                      <Panel header="Build Network" key={stepIndex}
                             className={styles.panel}>
                        {networkBuilder(step, stepIndex, steps[1].args[0].values, steps[2].args[0].values)}
                      </Panel>
                    )
                  case 'estimator':
                  case 'compile':
                  case 'fit':
                  case 'evaluate':
                    return (
                      <Panel header={step.display_name} key={stepIndex}
                             className={styles.panel}>
                        {renderParameters(step, stepIndex)}
                      </Panel>
                    );
                  case 'setting':
                    return (
                      <Panel header={step.display_name} key={stepIndex}
                             className={styles.panel}>
                        {setting(step, stepIndex)}
                      </Panel>
                    )
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
