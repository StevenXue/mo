import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Option from './Option';
import OptionElement from './OptionElement';
import Options from './Options';
import OptionsStepContainer from './OptionsStepContainer';

import {connect} from 'dva'
import {routerRedux} from 'dva/router'

class OptionsStep extends Component {
  /* istanbul ignore next */
  constructor(props) {
    super(props);

    this.renderOption = this.renderOption.bind(this);
    this.onOptionClick = this.onOptionClick.bind(this);
  }

  onOptionClick({ value, label }) {
    console.log("value", value)

    if(label === "发布需求"){
      this.props.dispatch({
        type: 'chatbot/updateState',
        payload: {
          opened: false
        }
      })
      this.props.dispatch(routerRedux.push(`/userrequest`))
      this.props.dispatch({type: 'allRequest/showModal'})
    }else if(label === "我发布的需求"){
      this.props.dispatch({
        type: 'chatbot/updateState',
        payload: {
          opened: false
        }
      })
      let user_ID = localStorage.getItem('user_ID');
      this.props.dispatch(routerRedux.push(`/profile/${user_ID}`))
    }
    else{
      this.props.triggerNextStep({ value });
    }


  }

  renderOption(option) {
    const { bubbleStyle } = this.props;
    const { user } = this.props.step;
    const { value, label, route } = option;
    const border = `1px solid ${option.borderColor}`
    //border:1px solid red
    return (
      <Option
        key={value}
        className="rsc-os-option"
      >
        <OptionElement
          className="rsc-os-option-element"
          style={bubbleStyle}
          user={user}
          onClick={() => this.onOptionClick({ value, label })}
          border={border}
        >
          {label}
        </OptionElement>
      </Option>
    );
  }

  render() {
    const { options } = this.props.step;

    return (
      <OptionsStepContainer className="rsc-os">
        <Options className="rsc-os-options">
          {_.map(options, this.renderOption)}
        </Options>
      </OptionsStepContainer>
    );
  }
}

OptionsStep.propTypes = {
  step: PropTypes.object.isRequired,
  triggerNextStep: PropTypes.func.isRequired,
  bubbleStyle: PropTypes.object.isRequired,
};

export default connect(({})=>({}))(OptionsStep);
