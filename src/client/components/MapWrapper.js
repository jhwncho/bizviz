import React, { Component } from 'react';

export default class MapWrapper extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return(
            <div>
                {this.props.children}
            </div>
        ); 
    }
}