import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import { Steps, Icon, Popover } from 'antd';
const Step = Steps.Step;

function ProgressBar(props){
  let {
    numSteps=5,
    finishedSteps=3,
    steps
  } = props


  let array = []
  for(let i=0;i<numSteps;i++){//缓存数组长度
    if(i<finishedSteps){
      array.push(true)
    }
    else {
      array.push(false)
    }
  }

  const customDot = (dot, { status, index }) => {
    let displayName = ""
    if(index>=steps.length){
      displayName = 'finished'
    }else{
      displayName = steps[index].display_name
    }

    return (

    <Popover content={<span>{displayName}</span>}>
      {/*{status==='finish'?<Icon type="check-circle-o" />:dot}*/}
      {dot}
    </Popover>
  )};


  return (
    <div>
    <Steps
      // progressDot
      // size="small"
      current={finishedSteps}
      // className={styles.steps}
       progressDot={customDot}
    >
      {array.map((e, index)=>{
        let displayName = ""
        if(index>=steps.length){
          displayName = 'finished'
        }else{
          displayName = steps[index].display_name
        }
        return <Step
          key={index}
          // title={displayName}
            // icon={<div className={styles.circle} />}
            //  icon={<Icon type="user" style={{ fontSize: 2, color: '#08c' }}/>}
            // className={styles.step}
        />
      }
          )}
    </Steps>

      {/*<div className={styles.circle} />*/}
    </div>
  )

  // return (
  //   <div className={styles.normal}>
  //     <div className={styles.bar}>
  //       {array.map((e)=>(
  //         <div>
  //           <div className={styles.circle}>
  //
  //           </div>
  //           <div className={styles.line}>
  //
  //           </div>
  //         </div>
  //       ))}
  //
  //     </div>
  //
  //   </div>
  // )
}

export default ProgressBar;
