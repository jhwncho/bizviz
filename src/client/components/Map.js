import React, { Component } from 'react';
import DeckGL, {GeoJsonLayer, IconLayer, PolygonLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import myData from '../../../data/bay_area_taz.json';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from 'url';
import {scaleThreshold} from 'd3-scale';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibHpoYW5nOTciLCJhIjoiY2pvMmI4NmRpMDBwMDN2bzh1bG5yb2pwNiJ9.PYMhqUHSeI5mAw12nxYc3w'; 


export default class Map extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {polygons, onViewStateChange, initialViewState} = this.props;
        let minTime = Number.MAX_SAFE_INTEGER , maxTime = 0;
        let domain = []
        for (let polygon of polygons) {
            minTime = Math.min(minTime, polygon.min_tt);
            maxTime = Math.max(maxTime, polygon.min_tt)
        }
        for (let i = 0; i < 12; i++) {
            domain.push(minTime + i * ((maxTime - minTime) / 12));

        }

        const COLOR_SCALE = scaleThreshold()
        .domain(domain)
        .range([
        [65, 182, 196],
        [127, 205, 187],
        [199, 233, 180],
        [237, 248, 177],
        // zero
        [255, 255, 204],
        [255, 237, 160],
        [254, 217, 118],
        [254, 178, 76],
        [253, 141, 60],
        [252, 78, 42],
        [227, 26, 28],
        [189, 0, 38],
        [128, 0, 38]
        ]);

        const formattedBusinesses = this.props.businesses.map((business) => {
            return {name: business.name, coordinates: [business.longitude, business.latitude]}
        })



        const layers = [
            // new GeoJsonLayer({
            //     data: myData,
            //     filled: false,
            //     stroked: true,
            //     pickable: true,
            //     wireframe: true,
            //     visible: true,
            //     getLineWidth: 5,
            //     lineWidthScale: 10
            // }),
            new PolygonLayer({
                id: 'polygon-layer',
                data: polygons,
                pickable: true,
                stroked: true,
                filled: true,
                wireframe: true,
                lineWidthMinPixels: 2,
                getPolygon: d => d.contour,
                // getElevation: d => d.population / d.area / 10,
                getFillColor: d => COLOR_SCALE(d.min_tt),
                getLineColor: [80, 80, 80],
                getLineWidth: 1,
              }),
            new IconLayer({
                data: formattedBusinesses,
                pickable: true,
                iconAtlas: '../../../data/map-marker.png',
                iconMapping: {
                    marker: {
                      x: 0,
                      y: 0,
                      width: 512,
                      height: 512,
                      anchorY: 128,
                      mask: true
                    }
                },
                sizeScale: 13,
                getPosition: d => d.coordinates,
                getIcon: d => 'marker',
                getSize: d => 5,
                getColor: d => [0, 0, 0],
                onHover: ({object}) => setTooltip(`${object.name}`)

            }), 
            
        ]

        return(
            <div>
                <DeckGL onViewStateChange={onViewStateChange} initialViewState={initialViewState} controller={true} layers={layers} width="100%" height="100%">
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