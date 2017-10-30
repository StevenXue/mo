import React from 'react'
import MySelection from './MySelection'

class StagedList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props,
    }
  }
  render() {
    return (
      <div>
      <MySelection {...this.props} isStaged={true}/>
      </div>
    )
  }
}

export default StagedList;
