import React from 'react'
import {
  Route,
  Link,
  routerRedux,
} from 'dva/router'
import { get } from 'lodash'
import { Button, Icon } from 'antd'
import Dots from './Dots'
import styles from './index.less'

const pageConfig = [
  {
    path: 'import',
    text: 'Import Data',
  },
  {
    path: 'analysis',
    text: 'Data Analysis',
  },
  {
    path: 'modelling',
    text: 'Modelling',
  },
  {
    path: 'deploy',
    text: 'Deployment',
  },

]

const paths = pageConfig.map(e => e.path)
const titles = pageConfig.map(e => e.text)
const num = 5
const radius = 5
const buttonSize = 30

function Steps({ match, history, location, dispatch, projectDetail }) {
  // get active page name from url
  const activePage = location.pathname.split('/')[3]
  const dis = radius * (num * 2 + 1)
  const activePageIndex = pageConfig.findIndex(e => e.path === activePage)

  const setDoneStep = (index) => {
    dispatch({ type: 'projectDetail/setDoneStep', payload: { index } })
  }

  return (
    <div className={styles.stepBar}>
      <div style={{ margin: `0 -${dis - 15}px` }}>
        <div className={styles.steps} style={{ margin: `10px ${dis}px` }}>
          {paths.map((p, i) => {
              let buttonType = 'primary'
              let content = i + 1
              let status = 0
              let color = '#D8D8D8'
              const indices = get(projectDetail, 'project.done_indices')
              if (indices && indices.includes(i)) {
                // done
                content = <Icon type="check" style={{ fontWeight: 900 }}/>
                status = 2
                color = '#6D9CF9'
              }
              if (paths[i] === activePage) {
                // doing
                status = 1
                content = i + 1
                color = '#6D9CF9'
              }
              return <div className={styles.step} key={paths[i]}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/workspace/${match.params.projectId}/${paths[i]}`}>
                    <Button
                      shape="circle"
                      type={buttonType}
                      style={{ width: buttonSize, height: buttonSize, background: color, border: color }}
                    >
                      {content}
                    </Button>
                  </Link>
                </div>
                {i < paths.length - 1 && <Dots num={num} radius={radius} status={status}/>}
              </div>
            },
          )}
        </div>
        <div className='flex-row-center' style={{ width: buttonSize * paths.length + dis * (paths.length * 2) }}>
          {titles.map((p, i) => {
              let fontWeight = 400
              const indices = get(projectDetail, 'project.done_indices')
              if (indices && indices.includes(i)) {
                // done
              }
              if (paths[i] === activePage) {
                // doing
                fontWeight = 700
              }
              return <div key={titles[i]} style={{ width: `${100 / paths.length}%`, textAlign: 'center' }}>
                <p style={{ fontWeight }}>{titles[i]}</p>
              </div>
            },
          )}
        </div>
      </div>
      {activePageIndex < paths.length - 1 &&
      <Link to={`/workspace/${match.params.projectId}/${paths[activePageIndex + 1]}`}>
        <Button className={styles.next} onClick={() => setDoneStep(activePageIndex)}>Next</Button>
      </Link>
      }
    </div>
  )
}

export default Steps
