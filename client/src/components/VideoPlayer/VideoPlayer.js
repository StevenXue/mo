import React, { Component } from 'react'
import ReactPlayer from 'react-player'
import styles from './VideoPlayer.less'


const VideoPlayer = (props) => {
  return (
    <div>
      <ReactPlayer url={[{src: props.src}]} width={410} height={310} playing controls />
    </div>
  )
}

export default VideoPlayer
