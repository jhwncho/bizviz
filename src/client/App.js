import React, { Component } from 'react';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import './app.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibHpoYW5nOTciLCJhIjoiY2pvMmI4NmRpMDBwMDN2bzh1bG5yb2pwNiJ9.PYMhqUHSeI5mAw12nxYc3w'; 

const INITIAL_VIEW_STATE = {
  latitude: 37.785164,
  longitude: -122.41669,
  zoom: 10,
  bearing: -5,
  pitch: 0
};

export default class App extends Component {
  
  async componentDidMount() {

  }

  render() {
    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} width="100%" height="100%">
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
        {/* <LineLayer
          data={[{sourcePosition: [-122.41669, 37.7883], targetPosition: [-122.41669, 37.781]}]}
          strokeWidth={5}
        /> */}
        {/* <ScatterplotLayer
          data={[{position: [-122.41669, 37.79]}]}
          radiusScale={100}
          getColor={x => [0, 0, 255]}
        /> */}
      </DeckGL>
    );
  }
}
