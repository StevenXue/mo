import React from 'react'
import styles from './GIFArea.less'

const GIFArea = (props) => {
  return (
    <div>
      <img src={props.src} alt='GIF area'/>
    </div>
  )
}

export default GIFArea
