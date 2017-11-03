import React from 'react';
import {Button} from 'antd'

import styles from './index.less'

import MyCard from '../../../../components/MyCard/index'
import Launcher from '../../common/components/MiddleArea/Launcher/Launcher'


function Guidance(props) {
  function handleClick() {
    console.log("handleClick")
    props.dispatch({
      type: props.namespace + '/setShowGuidance',
      payload: {
        showGuidance: false
      }
    })
  }
  return (
    <div>
      <div className={styles.title}>
        title
      </div>
      <div className={styles.title}>
        description
      </div>

      <div className={styles.navCards}>
        <MyCard icon='line-chart' text='Data Analysis' style={{marginRight: 50}}
                onClick={() => handleClick()}/>

        <MyCard icon='line-chart' text='Data Analysis' style={{marginRight: 50}}
                onClick={() => handleClick()}/>

        <MyCard icon='line-chart' text='Data Analysis' style={{marginRight: 50}}
                onClick={() => handleClick()}/>
      </div>


      <Launcher
        // sectionId={active_sectionId}
        type='guidance'
        {...props}/>

      <div className={styles.go_guide}>
        <Button onClick={() => props.dispatch({
          type: props.namespace + '/setShowGuidance',
          payload: {
            showGuidance: false
          }
        })}>
          go to workspace
        </Button>
      </div>
    </div>
  );
}

export default Guidance;
