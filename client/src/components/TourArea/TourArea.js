import React from 'react'
import VideoPlayer from '../VideoPlayer'
import styles from './TourArea.less'

const TourArea = (props) => {
  return (
    <div>
      {props.text}
      <VideoPlayer src={props.src}/>
    </div>
  )
}

export default TourArea
