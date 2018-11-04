import React, { Component } from 'react';
import MapDCon from '@mapd/connector/dist/browser-connector';
import Map from './components/Map'
import DropDown from './components/DropDown'
import Menu from '@material-ui/core/Menu';
import ContainedButton from './components/ContainedButton'
import { withStyles } from '@material-ui/core/styles';

import './app.css';

const INITIAL_VIEW_STATE = {
  latitude: 37.867894,
  longitude: -122.257867,
  zoom: 10,
  bearing: -5,
  pitch: 0
};

const businessCategories = {
  Food: {American: 'tradamerican', Chinese: 'chinese', Italian: 'italian', Japanese: 'japanese', Mexican: 'mexican'},
  Nightlife: {Bars: 'bars', 'Beer Gardens': 'beergardens', 'Dance Clubs': 'danceclubs', Karaoke: 'karaoke'}
}

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      latitude: INITIAL_VIEW_STATE.latitude,
      longitude: INITIAL_VIEW_STATE.longitude,
      category: Object.keys(businessCategories)[0],
      type: Object.keys(businessCategories.Food)[0],
      businesses: []
    }

    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.searchBusinesses = this.searchBusinesses.bind(this);
  }

  handleCategoryChange(value) {
    this.setState({category: value, type: Object.keys(businessCategories[value])[0]})
  }
  handleTypeChange(value) {
    this.setState({type: value})
  }

  async searchBusinesses(category) {
    const res = await fetch('/api/businessSearch/' + category);
    if (res) {
      const resJSON = await res.json();
      let businesses = resJSON.businesses;
      this.setState({businesses})
    }
  }
  
  async componentDidMount() {
    // await this.searchBusinesses('bubbletea'); // Just for fun
  }

  render() {
    const searchTerm = businessCategories[this.state.category][this.state.type]
    return (
      <div>
        <Map initialViewState={INITIAL_VIEW_STATE} {...this.state} />
        <div style={{position: 'absolute'}}>
          Select Business Category: 
          <DropDown value={this.state.category} choices={Object.keys(businessCategories)} onChange={this.handleCategoryChange}/>
          Type:
          <DropDown value={this.state.type} choices={Object.keys(businessCategories[this.state.category])} onChange={this.handleTypeChange}/>  
          <ContainedButton onClick={() => {this.searchBusinesses(searchTerm)}}color='primary' text='Search'></ContainedButton>  
        </div>
      </div> 
    );
  }
}
