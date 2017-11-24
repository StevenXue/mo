import React from 'react'

import styles from './index.less'

import MyCard from '../../../../components/MyCard/index'
import {IconDict} from '../../../../utils/constant'


function Guidance(props) {
  const {
    algorithms,
  } = props.model

  function handleClick() {
    console.log('handleClick')
    props.dispatch({
      type: props.namespace + '/setShowGuidance',
      payload: {
        showGuidance: false,
      },
    })
  }

  return (
    props.namespace === 'dataAnalysis' ? <div className={styles.container}>
      <div className={styles.title}>
        Data anaysis tools help you to explore and analyze your data.
        <br/>
        If you're new to data anaysis, then start here.
      </div>

      <div className={styles.navCards}>
        {
          algorithms.map((algorithm, cardIndex) =>
            <MyCard key={algorithm.name}
                    // icon={Icons[cardIndex]}
                    text={algorithm.us_name}
                    style={{ marginRight: 50 }}
                    hasDescription={true}
                    description={algorithm.des}
                    onClick={() => handleClick()}
                    imgPath={IconDict[algorithm.name]}
            />,
          )
        }
      </div>
      </div> :
      <div>
        <div className={styles.title}>
          Learn how to build and deploy  a model with our modelling workspace.
        <br/> If you're new to modelling, then
          start here.
        </div>
        <div  className={styles.navCards}>
          {
            algorithms.map((algorithm,cardIndex)=>
              <MyCard key={algorithm.name}
                      // icon={Icons[cardIndex]}
                      text={algorithm.name}
                      style={{marginRight: 50}}

                      hasDescription={true}
                      description={algorithm.des}
                      onClick={() => handleClick()}
                      imgPath={IconDict[algorithm.name]}
              />,

            )
          }
        </div>
    </div>
  )
}

export default Guidance;
