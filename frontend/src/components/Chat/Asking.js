import React, {Component} from 'react'

class ShowApiDetail extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    // 提问 api
    //fetch

    this.props.triggerNextStep()
  }

  render() {
    // const {show_api_detail: {value}} = this.props.steps
    return (
      <div>
        提问成功
      </div>
    )

  }
}

export default ShowApiDetail
