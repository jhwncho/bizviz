import React, { Component } from 'react';

export default class DropDown extends Component {
    constructor(props) {
      super(props);
  
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {
      const choice = event.target.value;
      this.props.onChange(choice);
    }
  
    render() {
      const {choices} = this.props;
      return (
        <select value={this.props.value} onChange={this.handleChange}>
        {
          choices.map((choice) => {
            return (<option key={choice}>{choice}</option>)
          })
        }
        </select>
      );
    }
  }