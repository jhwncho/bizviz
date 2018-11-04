import React, { Component } from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import myData from '../../../data/bay_area_taz.json';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibHpoYW5nOTciLCJhIjoiY2pvMmI4NmRpMDBwMDN2bzh1bG5yb2pwNiJ9.PYMhqUHSeI5mAw12nxYc3w'; 

export default class MapWrapper extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return(
            <div>
                <DeckGL initialViewState={this.props.initialViewState} controller={true} width="100%" height="100%">
                    <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
                    { <GeoJsonLayer
                        data={myData}
                        filled={false}
                        stroked={true}
                        pickable={true}
                        wireframe={true}
                        visible={true}
                        lineWidthScale={10}
                        lineWidthMinPixels={2}
                    /> }
                </DeckGL>
            </div>
        ); 
    }
}