import React, { Component } from 'react';
import MapDCon from '@mapd/connector/dist/browser-connector';
import Map from './components/Map'
import DropDown from './components/DropDown'
import Menu from '@material-ui/core/Menu';
import ContainedButton from './components/ContainedButton'
import { withStyles } from '@material-ui/core/styles';
import qs from 'query-string';
import './app.css';

const INITIAL_VIEW_STATE = {
  latitude: 37.867894,
  longitude: -122.257867,
  zoom: 10,
  bearing: -5,
  pitch: 0
};


const businessCategories = {
  Active: {Archery: 'archery', 'Basketball Courts': 'basketballcourts', 'Martial Arts': 'martialarts', 'Paintball': 'paintball', 'Yoga': 'yoga' },
  'Beauty & Spas': {Barbers: 'barbers', 'Day Spas': 'spas', 'Hair Salons': 'hair', Massage: 'massage', 'Skin Care': 'skincare', 'Tattoos': 'tattoo'},
  Health: {Acupuncture: 'acupuncture', Chiropractors: 'chiropractors', 'Counseling & Mental Health': 'c_and_mh', Dentists: 'dentists', Hospitals: 'hospitals', Pharmacy: 'pharmacy', Physicians: 'physicians', 'Urgent Care': 'urgent_care' },
  Entertainment: {Arcades: 'arcades', Casinos: 'casinos', Cinema: 'movietheaters', Museums: 'museums', 'Performing Arts': 'theater'},
  Nightlife: {Bars: 'bars', 'Beer Gardens': 'beergardens', 'Dance Clubs': 'danceclubs', Karaoke: 'karaoke'},
  Restaurants: {American: 'tradamerican', Chinese: 'chinese', Italian: 'italian', Japanese: 'japanese', Mexican: 'mexican'},
  Shopping: {Bookstores: 'bookstores', Electronics: 'electronics', 'Men\'s Clothing': 'menscloth', 'Women\'s Clothing': 'womenscloth', 'Sporting Goods': 'sportgoods'}
}

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      latitude: INITIAL_VIEW_STATE.latitude,
      longitude: INITIAL_VIEW_STATE.longitude,
      category: Object.keys(businessCategories)[0],
      type: Object.keys(businessCategories.Active)[0],
      businesses: [], 
      polygons: [],
    }

    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleViewStateChange = this.handleViewStateChange.bind(this);
    this.searchBusinesses = this.searchBusinesses.bind(this);
  }

  handleCategoryChange(value) {
    this.setState({category: value, type: Object.keys(businessCategories[value])[0]})
  }
  
  handleTypeChange(value) {
    this.setState({type: value})
  }

  handleViewStateChange(viewState) {
    const {latitude, longitude} = viewState.viewState;
    this.setState({latitude, longitude})
  }

  async searchBusinesses(category) {
    const {latitude, longitude} = this.state;
    const query = qs.stringify({category, latitude, longitude})
    const res = await fetch('/api/businessSearch?' + query);

    if (res) {
      const resJSON = await res.json();
      let businesses = resJSON.businesses;
      let polygons = []
      if (businesses.length > 0) {
        let query = `
          SELECT MOVEMENT_ID 
          FROM san_francisco_taz 
        `;
        for (let i = 0; i < businesses.length; i++) {
          const business = businesses[i];
          if (i == 0) {
            query += ` WHERE ST_CONTAINS(san_francisco_taz.omnisci_geo, ST_GeomFromText('POINT(${business.longitude} ${business.latitude})', 4326)) `
          } else {
            query += ` OR ST_CONTAINS(san_francisco_taz.omnisci_geo, ST_GeomFromText('POINT(${business.longitude} ${business.latitude})', 4326))`
          }
        }
        const omnisciRes = await this.queryOmnisci(query);
        const regionIDs = omnisciRes.map((obj) => {
          return obj.MOVEMENT_ID
        });
        const min_tt_query = `
          select min_tt, sourceid, s1.omnisci_geo
          from (select min(avg_tt) as min_tt, sourceid
          from (select avg(u1.tt_mean) as avg_tt, u1.sourceid, u1.dstid
                from uber_movement_data as u1
                where u1.dstid in (${regionIDs.join(',')})
                and u1.sourceid > 2537 and u1.dstid < 5806
                group by u1.sourceid, u1.dstid) as averages
          GROUP BY averages.sourceid) as min_avg_tt, san_francisco_taz as s1
          WHERE s1.MOVEMENT_ID = min_avg_tt.sourceid
          order by sourceid
        `;
        const min_tts = await this.queryOmnisci(min_tt_query);
        polygons = min_tts.map((obj) => {
            const nums = obj.omnisci_geo.replace(/(MULTIPOLYGON)|[\(\)]/g, '').trim().replace(/ /g, ',').split(',')
            const contour = []
            for (let i=0; i < nums.length;i+=2) {
              contour.push([parseFloat(nums[i]), parseFloat(nums[i+1])])
            }
            return {contour, min_tt: obj.min_tt, sourceid: obj.sourceid}
        })
      }
      this.setState({businesses, polygons})
    }
  }


  async queryOmnisci(query) {
    const connector = new MapdCon();
    const defaultQueryOptions = {};
    const session = await connector.protocol('https')
    .host('use2-api.mapd.cloud')
    .port('443')
    .dbName('mapd')
    .user('F85929885DCAD4EE4812')
    .password('VHPsdFmDtDN7AHyVHMjXiitzL3rmYqUg5rQBIj6a')
    .connectAsync()

    const values = await session.queryAsync(query, defaultQueryOptions);
    return values;
  }

  async componentDidMount() {
    // await this.searchBusinesses('bubbletea'); // Just for fun
  }

  render() {
    const searchTerm = businessCategories[this.state.category][this.state.type]
    return (
      <div>
        <Map onViewStateChange={this.handleViewStateChange} initialViewState={INITIAL_VIEW_STATE} {...this.state} />
        <div style={{position: 'absolute'}}>
          Select Business Category: 
          <DropDown value={this.state.category} choices={Object.keys(businessCategories)} onChange={this.handleCategoryChange}/>
          Type:
          <DropDown value={this.state.type} choices={Object.keys(businessCategories[this.state.category])} onChange={this.handleTypeChange}/>  
          <ContainedButton onClick={() => {this.searchBusinesses(searchTerm)}}color='primary' text='Search'></ContainedButton> 
          <ContainedButton onClick={() => {this.getRegionIDs()}}color='primary' text='Query'></ContainedButton> 
        </div>
      </div> 
    );
  }
}
