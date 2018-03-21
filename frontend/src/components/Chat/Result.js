import React, {Component} from 'react'

class ShowApiDetail extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    this.props.triggerNextStep()
  }

  render() {
    const {show_api_detail: {value}} = this.props.steps
    return (
      <div>
        result: {value}
      </div>
    )

  }
}

export default ShowApiDetail
