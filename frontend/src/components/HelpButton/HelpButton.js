import React, { Component } from 'react'
import { Button } from 'antd'
import Joyride from 'react-joyride'

import styles from './index.less'

const ALLSTEPS = [
  [{
    text: '进入项目开发环境',
    selector: '.jp-PythonIcon',
    position: 'bottom-left',
    // isFixed:true,
    style: {
      borderRadius: 0,
      color: '#34BFE2',
      textAlign: 'center',
      width: '12rem',
      height: '60px',
      mainColor: '#ffffff',
      backgroundColor: '#ffffff',
      beacon: {
        inner: '#0ae713 ',
        outer: '#77Eb7c',
      },
      close: {
        display: 'none',
      },
    },
  }],

  [{
    text: '状态',
    selector: '.jp-CircleIcon',
    position: 'bottom-left',
    // isFixed:true,
    style: {
      borderRadius: 0,
      color: '#34BFE2',
      textAlign: 'center',
      width: '12rem',
      height: '60px',
      mainColor: '#ffffff',
      backgroundColor: '#ffffff',
      beacon: {
        inner: '#0ae713 ',
        outer: '#77Eb7c',
      },
      close: {
        display: 'none',
      },
    },
  }],
]

const JOYRIDE = [
  {
    text: 'python',
    selector: '.jp-PythonIcon',
    position: 'bottom-left',
  },{
    text: '进入项目开发环境',
    selector: '.jp-PythonIcon',
    position: 'bottom-left',
  }
]

export class HelpButton extends React.Component {
  state = {
    run: false,
    allSteps: [],
  }

  componentDidMount() {
    window.addEventListener('trigger_tooltip', () => {
      console.log('触发了')
      setTimeout(() => {
        this.setState({ run: true })
        this.setState({
          allSteps: ALLSTEPS,
        })
      }, 1000)
    }, false)
  }

  render() {
    return <div className={styles.cbtn}>
      <Button size="small">
        hint
      </Button>

      {/*{*/}
        {/*ALLSTEPS.map(()=> {*/}
            {/*return (*/}
              {/*<Joyride*/}
                {/*key=*/}
                {/*ref={c => (this.joyride1 = c)}*/}
                {/*debug={false}*/}
                {/*run={true}*/}
                {/*steps={this.state.steps}*/}
                {/*autoStart*/}
                {/*tooltipOffset={10}*/}
                {/*showOverlay={false}*/}
                {/*locale={{*/}
                  {/*close: null,*/}
                {/*}}*/}
              {/*/>*/}
            {/*)*/}
          {/*}*/}
        {/*)*/}
      {/*}*/}


    </div>
  }
}
