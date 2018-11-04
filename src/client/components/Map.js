import React, { Component } from 'react';
import DeckGL, {GeoJsonLayer, IconLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import myData from '../../../data/bay_area_taz.json';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from 'url';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibHpoYW5nOTciLCJhIjoiY2pvMmI4NmRpMDBwMDN2bzh1bG5yb2pwNiJ9.PYMhqUHSeI5mAw12nxYc3w'; 

export default class Map extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const formattedBusinesses = this.props.businesses.map((business) => {
            return {name: business.name, coordinates: [business.longitude, business.latitude]}
        })

        const layers = [
            new GeoJsonLayer({
                data: myData,
                filled: false,
                stroked: true,
                pickable: true,
                wireframe: true,
                visible: true,
                getLineWidth: 5,
                lineWidthScale: 10
            }),
            new IconLayer({
                data: formattedBusinesses,
                pickable: true,
                iconAtlas: '../../../data/icon-atlas.png',
                iconMapping: {
                    marker: {
                      x: 0,
                      y: 0,
                      width: 128,
                      height: 128,
                      anchorY: 128,
                      mask: true
                    }
                },
                sizeScale: 15,
                getPosition: d => d.coordinates,
                getIcon: d => 'marker',
                getSize: d => 5,
                getColor: d => [200, 140, 0],
                onHover: ({object}) => setTooltip(`${object.name}`)

            })
        ]

        return(
            <div>
                <DeckGL initialViewState={this.props.initialViewState} controller={true} layers={layers} width="100%" height="100%">
                    <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
                     {/* <GeoJsonLayer
                        data={myData}
                        filled={false}
                        stroked={true}
                        pickable={true}
                        wireframe={true}
                        visible={true}
                        getLineWidth={1}
                        lineWidthScale={5}
                    />  */}
                </DeckGL>
            </div>
        ); 
    }
}