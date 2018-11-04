import React, { Component } from 'react';

class DropDown extends Component {
    constructor(props) {
      super(props);
      this.state = {value: ''};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit(event) {
        alert('You chose: ' + this.state.value);
        //add more functionality like sending to prop/state? after
      event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Select the category to query on:
            <select value={this.state.value} onChange={this.handleChange}>
              <option value="Grocery Stores">Grocery Stores</option>
              <option value="Gym">Gym</option>
              <option value="Mexican Restaurant">Mexican Restaurant</option>
              <option value="Japanese Restaurant">Japanese Restaurant</option>
            </select>
          </label>
          <input type="submit" value="Submit" />
        </form>
      );
    }
  }