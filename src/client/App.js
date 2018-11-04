import React, { Component } from 'react';
import MapDCon from '@mapd/connector/dist/browser-connector';
import MapWrapper from './components/MapWrapper'
import './app.css';

const INITIAL_VIEW_STATE = {
  latitude: 37.867894,
  longitude: -122.257867,
  zoom: 10,
  bearing: -5,
  pitch: 0
};

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      latitude: INITIAL_VIEW_STATE.latitude,
      longitude: INITIAL_VIEW_STATE.longitude
    }
  }

  async searchBusinesses(category) {
    const res = await fetch('/api/businessSearch/' + category);
    if (res) {
      const resJSON = await res.json();
      let businesses = resJSON.businesses;
      console.log('Businesses: ', businesses); 
    }
  }
  
  async componentDidMount() {
    await this.searchBusinesses('bubbletea'); // Just for fun
  }

  render() {
    return (
      <MapWrapper initialViewState={INITIAL_VIEW_STATE} {...this.state} />
    );
  }
}
