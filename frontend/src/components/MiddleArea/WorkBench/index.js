import React from 'react'
import styles from './index.less'
import {connect} from 'dva'

import {Select, Collapse, Button, Input, Popover, Icon, Tooltip} from 'antd';
import ToolBar from '../ToolBar/index';
import ParamsMapper from '../../ParamsMapper'
import {format} from '../../../utils/base';


import LayerCard from '../../../routes/workspace/modelling/LayerCard';
import {get} from 'lodash';

// import  from '../../../index.less'

const Option = Select.Option;
const Panel = Collapse.Panel;

import {translateDict} from '../../../constants'


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
);


function WorkBench({section, model, dispatch, namespace, preview}) {
  //state
  const {
    sectionsJson,
    mouseOverField,
  } = model;

  const {
    stagingDataList
  } = preview;

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
      steps: baseSteps
    }
  } = section;

  //functions 下拉框选择
  function handleChange(value, index, argIndex) {
    // section.steps[index].args[argIndex].values = [value]; 备选方案以后再加相应的reducer

    sectionsJson[section._id].steps[index].args[argIndex].value = value;

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
    });
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

  function handleClickField(fieldName, stepIndex, argIndex) {
    dispatch({
      type: namespace + '/addRemoveField',
      payload: {
        stepIndex,
        argIndex,
        fieldName,
        sectionId: section._id,
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

    e = format(e, baseSteps[stepIndex].args[argIndex]["value_type"]);
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

  function fieldSelector(datasourceStep, step, stepIndex) {

    return (
      <div>
        <div className={styles.fields}>
          {
            step.args.map((arg, argIndex)=>{
              let fields = get(datasourceStep, `args[${argIndex}].fields`, []);

              return fields.map((field)=><div
                key={field[0]}
                className={styles.field}
                onClick={() => handleClickField(field[0], stepIndex, argIndex)}
                style={{
                  backgroundColor: (step.args[argIndex].values).includes(field[0]) ? '#34C0E2' : '#F3F3F3',
                  color: mouseOverField === field[0] ? 'green' : 'grey',
                }}
                onMouseOver={() => handleMouseOverField(field[0])}
                onMouseLeave={() => handleMouseLeaveField()}
              >
                <p className={styles.text}>{field[0]}</p>
              </div>,)

            })
          }

          {/*{step.args[0]['fields'] && step.args[0].fields.map(field =>*/}
            {/*<div*/}
              {/*key={field[0]}*/}
              {/*className={styles.field}*/}
              {/*onClick={() => handleClickField(field[0], stepIndex)}*/}
              {/*style={{*/}
                {/*backgroundColor: (step.args[0].values).includes(field[0]) ? '#34C0E2' : '#F3F3F3',*/}
                {/*color: mouseOverField === field[0] ? 'green' : 'grey',*/}
              {/*}}*/}
              {/*onMouseOver={() => handleMouseOverField(field[0])}*/}
              {/*onMouseLeave={() => handleMouseLeaveField()}*/}
            {/*>*/}
              {/*<p className={styles.text}>{field[0]}</p>*/}
            {/*</div>,*/}
          {/*)}*/}
        </div>
        <div className={styles.end_button}>
          {
            LastOrRunButton(stepIndex, stepLength)
          }
        </div>

      </div>)
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

  function networkBuilder(step, stepIndex) {
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
                    baseSteps={baseSteps}
                    {...{model, dispatch, namespace}}
                    funcs={{
                      addValue: (e) => addValue(e, stepIndex, argIndex, valueIdx + 1),
                      setValueOfValues: (e) => setValueOfValues(e, stepIndex, argIndex, valueIdx),
                      updateValueOfValues: (e) => updateValueOfValues(e, stepIndex, argIndex, valueIdx),
                      updateLayerArgs: (e) => updateLayerArgs(e, stepIndex, argIndex, valueIdx),
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
        <ParamsMapper args={step.args} setValue={(value, argIndex) => setValue(value, stepIndex, argIndex)}/>
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
                      namespace
                    }
                  });
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

  const stepLength = steps.length;

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

  // function parameters(step, stepIndex) {
  //   return (
  //     <div>
  //       <ParamsMapper args={step.args} setValue={(value, argIndex) => setValue(value, stepIndex, argIndex)}/>
  //       <div className={styles.end_button}>
  //         {
  //           LastOrRunButton(stepIndex, stepLength)
  //         }
  //       </div>
  //     </div>
  //   );
  //   // return (
  //   //   <div>
  //   //     {
  //   //       step.args.map((arg, argIndex) =>
  //   //         <div className={styles.pair} key={arg.name + argIndex}>
  //   //                           <span>
  //   //                             {getArgs(baseSteps, stepIndex, argIndex).display_name}
  //   //                           </span>
  //   //           <div className={styles.row}>
  //   //             <Input placeholder="" defaultValue={arg.value}
  //   //                    onChange={(e) => handleOnChangeArgs(e.target.value, stepIndex, argIndex)}/>
  //   //
  //   //
  //   //             <div className={styles.help}>
  //   //               <Tooltip title={getArgs(baseSteps, stepIndex, argIndex).des}>
  //   //                 <Icon type="question-circle-o"/>
  //   //               </Tooltip>
  //   //
  //   //               {/*<Popover content={content(getArgs(baseSteps, stepIndex, argIndex).des)}*/}
  //   //               {/*title="Help info">*/}
  //   //               {/*<Icon type="question-circle-o"/>*/}
  //   //               {/*</Popover>*/}
  //   //             </div>
  //   //
  //   //           </div>
  //   //         </div>,
  //   //       )
  //   //     }
  //   //     <div className={styles.end_button}>
  //   //       {
  //   //         LastOrRunButton(stepIndex, stepLength)
  //   //       }
  //   //     </div>
  //   //   </div>
  //   // )
  // }

  return (
    <div>
      <ToolBar sectionId={sectionId} {...{model, dispatch, namespace}}/>
      <div className={styles.container}>
        <Collapse className={styles.collapse}
                  defaultActiveKey={['data_source']} onChange={callback}
                  activeKey={active_steps}
        >
          {
            steps.map((step, stepIndex) => {
                switch (step.name) {
                  case 'data_source':
                    return (
                      <Panel
                        className={styles.panel}
                        header={getArgs(baseSteps, stepIndex).display_name} key={stepIndex}>
                        {dataSource(step.args, stepIndex)}
                      </Panel>
                    );
                  case 'fields':
                    return <Panel header="Select Fields" key={stepIndex}
                                  className={styles.panel}
                    >
                      {fieldSelector(steps[0], step, stepIndex)}
                    </Panel>
                  case 'feature_fields':
                    return (
                      <Panel header="Select Feature Fields" key={stepIndex}
                             className={styles.panel}>
                        {fieldSelector(steps[0], step, stepIndex)}

                      </Panel>
                    );
                  case 'label_fields':
                    return <Panel header="Select Label Fields" key={stepIndex}
                                  className={styles.panel}>
                      {fieldSelector(steps[0], step, stepIndex)}
                    </Panel>
                  case 'parameters':
                    return (
                      <Panel header="Parameter" key={stepIndex}
                             className={styles.panel}>
                        {renderParameters(step, stepIndex)}
                      </Panel>
                    )
                  case 'layers':
                    return (
                      <Panel header="Build Network" key={stepIndex}
                             className={styles.panel}>
                        {networkBuilder(step, stepIndex)}
                      </Panel>
                    )
                  case 'custom':
                    return (
                      <Panel header={step.display_name} key={stepIndex}
                             className={styles.panel}>
                        {renderParameters(step, stepIndex)}
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
