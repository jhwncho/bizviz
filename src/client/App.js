import React, { Component } from 'react';
import Map from './components/Map';
import ContainedButton from './components/ContainedButton';
import qs from 'query-string';
import './app.css';
import Select from 'react-select';


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
      longitude: INITIAL_VIEW_STATE.longitude,
      businesses: [], 
      polygons: [],
      suggestions: [],
      suggestionMap: {},
      searchTerm: ''
    }

    this.handleViewStateChange = this.handleViewStateChange.bind(this);
    this.searchBusinesses = this.searchBusinesses.bind(this);
    this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
  }

  async componentDidMount() {
    // await this.searchBusinesses('bubbletea'); // Just for fun
  }

  handleViewStateChange(viewState) {
    const {latitude, longitude} = viewState.viewState;
    this.setState({latitude, longitude})
  }

  async searchBusinesses(category) {
    const {latitude, longitude} = this.state;
    const query = qs.stringify({category, latitude, longitude});
    const res = await fetch('/api/businessSearch?' + query);

    if (res) {
      const resJSON = await res.json();
      let {businesses, polygons} = resJSON;
      this.setState({businesses, polygons})
    }
  }

  async getSearchSuggestions(term) {
    if (term && term.length > 0) {
      const query = qs.stringify({term});
      const res = await fetch('/api/searchSuggestions?' + query);
      if (res) {
        const {categories} = await res.json();
        let newSuggestions = [];
        let newSuggestionMap = {};
        for (let category of categories) {
          newSuggestions.push({value: category.alias, label: category.title})
          newSuggestionMap[category.title] = category.alias;
        }
        this.setState({searchTerm: term, suggestions: newSuggestions, suggestionMap: newSuggestionMap});
      }
    }
  }

  render() {
    const yelpCategory = this.state.suggestionMap[this.state.searchTerm] || '';

    const searchStyles = {
      container: (provided, state) => ({
        width: '300px',
        fontFamily: 'arial'
      }),
      menu: (provided, state) => ({
        ...provided,
        width: '300px'
      })
    }
    return (
      <div>
        <Map onViewStateChange={this.handleViewStateChange} initialViewState={INITIAL_VIEW_STATE} {...this.state} />
        <div style={{position: 'absolute', display:'flex', width: '100%'}}>
          <Select
            className="basic-single"
            classNamePrefix="select"
            isDisabled={false}
            isSearchable={true}
            onChange={(value, action) => {this.setState({searchTerm: value.label})}}
            onInputChange={(newValue) => {this.getSearchSuggestions(newValue)}}
            options={this.state.suggestions}
            styles={searchStyles}
          />
          <ContainedButton onClick={() => {this.searchBusinesses(yelpCategory)}}color='primary' text='Search'></ContainedButton> 
        </div>
      </div> 
    );
  }
}
