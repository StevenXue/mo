import React from 'react';
import {Button} from 'antd'

import styles from './index.less'

import MyCard from '../../../../components/MyCard/index'
import Launcher from '../../common/components/MiddleArea/Launcher/Launcher'

const Icons = [
  "tablet",
  'line-chart',
  "schedule",
  "select"
]

function Guidance(props) {
  const {
    algorithms
  } = props.model

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
    props.namespace === 'dataAnalysis' ?
      <div>
        <div className={styles.title}>
          Learn how to build and deploy on App Engine with a simple 'Hello World' app. If you're new to App Engine, then
          start here.
        </div>
        {/*<div className={styles.title}>*/}
        {/*description*/}
        {/*</div>*/}

        <div className={styles.navCards}>
          {
            algorithms.map((algorithm,cardIndex)=>
              <MyCard key={algorithm.name}
                icon={Icons[cardIndex]} text={algorithm.name} style={{marginRight: 50}}
                      onClick={() => handleClick()}/>
            )
          }
        </div>
        {/*<Launcher*/}
        {/*// sectionId={active_sectionId}*/}
        {/*type='guidance'*/}
        {/*{...props}/>*/}

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
      </div> :
      <div>
        <div className={styles.title}>
          Learn how to build and deploy on App Engine with a simple 'Hello World' app. If you're new to App Engine, then
          start here.
        </div>
        {/*<div className={styles.title}>*/}
        {/*description*/}
        {/*</div>*/}

        <div className={styles.navCards}>
          {
            algorithms.map((algorithm,cardIndex)=>
              <MyCard key={algorithm.name}
                      icon={Icons[cardIndex]} text={algorithm.name} style={{marginRight: 50}}
                      onClick={() => handleClick()}/>
            )
          }
        </div>

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
