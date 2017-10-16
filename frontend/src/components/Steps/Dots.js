import React from 'react'
import { Button } from 'antd'

import styles from './Dots.less'

function Dots({ num, radius }) {
  return (
    <div className={styles.normal} style={{ margin: radius }}>
      {Array.from(Array(num).keys()).map(i =>
        <div key={i} className={styles.dot} style={{ width: radius * 2, height: radius * 2, margin: radius }}/>,
      )}
    </div>
  )
}

export default Dots
