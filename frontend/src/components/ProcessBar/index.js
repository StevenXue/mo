import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import { Steps } from 'antd';
const Step = Steps.Step;

function ProgressBar(props){
  let {
    numSteps=5,
    finishedSteps=3
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

  return (
    <Steps progressDot current={finishedSteps}>
      {array.map((e, i)=><Step key={i}/>)}
    </Steps>
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
