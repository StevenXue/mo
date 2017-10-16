import React from 'react'
import {
  Route,
  Link,
} from 'react-router-dom'
import { Select, Button } from 'antd'
import Dots from './Dots'
import styles from './index.less'

const pages = ['import', 'analysis', 'modelling', 'deploy']
const num = 5
const radius = 5
const buttonSize = 30

function Steps({ match, history, location }) {
  console.log(match, location)
  // get active page name from url
  const [activePage] = location.pathname.split('/').slice(-1)
  const dis = radius*(num*2+1)
  return (
    <div>
      <div className={styles.steps} style={{margin: `10px ${dis}px`}}>
        {pages.map((p, i) =>
          <div className={styles.step} key={pages[i]}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                shape="circle"
                type={pages[i] === activePage ? 'primary' : 'default'}
                style={{ width: buttonSize, height: buttonSize }}
                onClick={() => history.push(`/projects/${match.params.projectID}/${pages[i]}`)}>
                {i + 1}
              </Button>
            </div>
            {i < pages.length - 1 && <Dots num={num} radius={radius}/>}
          </div>,
        )}
      </div>
      <div className='flex-row-center' style={{width: buttonSize*pages.length+dis*(pages.length*2)}} >
        {pages.map((p, i) =>
          <div key={pages[i]} className='capitalize-first' style={{width: `${100/pages.length}%`, textAlign: 'center'}} >
            <p> {pages[i]}</p>
          </div>,
        )}
      </div>
    </div>
  )
}

export default Steps
