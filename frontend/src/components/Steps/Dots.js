import React from 'react'
import { Button } from 'antd'
import { gradientColors } from '../../utils'

import styles from './Dots.less'

const statusDict = {
  0: gradientColors('#D8D8D8', '#D8D8D8', 5),
  1: gradientColors('#6D9CF9', '#D8D8D8', 5),
  2: gradientColors('#6D9CF9', '#6D9CF9', 5),
}

function Dots({ num, radius, status }) {
  const colorArray = statusDict[status]
  return (
    <div className={styles.normal} style={{ margin: radius }}>
      {Array.from(Array(num).keys()).map(i =>
        <div key={i} className={styles.dot}
             style={{ width: radius * 2, height: radius * 2, margin: radius, background: colorArray[i] }}/>,
      )}
    </div>
  )
}

export default Dots
