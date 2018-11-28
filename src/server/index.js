const MapdCon = require('@mapd/connector/dist/node-connector');

const express = require('express');
const os = require('os');

const app = express();
const yelp = require('yelp-fusion');
const client = yelp.client('SfWxRRxbB6yzezKqksOZ5dIND3mI8FZNJigXhI62tFcvvy9Z8IHOpL6Pc4KCVYKvnXZR_zTPV9c6EI467UXzNSRS02KoKCG6tqQsDpZTtjKKyzw4fC-uDyvme43eW3Yx');

async function queryOmnisci(query) {
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
    // console.log('Values: ', values)
    return values;
}

app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => {
    res.send({username: os.userInfo().username }) 
    console.log('Username: ', os.userInfo().username)
});

/* Response = {
    businesses: [{name: , latitude, longitude}]
}

*/ 

app.get('/api/searchSuggestions', async(req, res)=> {
    const {term} = req.query;
    console.log('searchSuggestions Query Params: ', req.query);

    client.autocomplete({
        text: term,
    }).then(yelpResponse => {
        const body = JSON.parse(yelpResponse.body);
        console.log('searchSuggestions response body: ', body);
        res.send({categories: body.categories})
        console.log('Sending: ', body.categories);
    });
})

app.get('/api/businessSearch', async (req, res)=> {
    const {category, latitude, longitude} = req.query;
    console.log('businessSearch Query Params: ', req.query);
    
    client.search({
        categories: category,
        latitude: latitude,
        longitude: longitude,
        limit: 50,
    }).then(async (yelpResponse)  => {
        const body = JSON.parse(yelpResponse.body)
        // console.log(body);
        let businesses = []
        let polygons = []
        for (let business of body.businesses) {
            console.log(business.name + ' categories: ', business.categories);
            const {latitude, longitude} = business.coordinates
            businesses.push({name: business.name, latitude, longitude})
        }
        // console.log(businesses);
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
            const omnisciRes = await queryOmnisci(query);
            const regionIDs = omnisciRes.map((obj) => {
                return obj.MOVEMENT_ID
            });
            const min_tt_query = `
                select min_tt, sourceid, s1.omnisci_geo
                from (select min(avg_tt) as min_tt, sourceid
                from (select avg(u1.tt_mean) as avg_tt, u1.sourceid, u1.dstid
                    from uber_movement_data as u1
                    where u1.dstid in (${regionIDs.join(',')})
                    group by u1.sourceid, u1.dstid) as averages
                GROUP BY averages.sourceid) as min_avg_tt, san_francisco_taz as s1
                WHERE s1.MOVEMENT_ID = min_avg_tt.sourceid
                order by sourceid
            `;
            const min_tts = await queryOmnisci(min_tt_query);
            polygons = min_tts.map((obj) => {
                const nums = obj.omnisci_geo.replace(/(MULTIPOLYGON)|[\(\)]/g, '').trim().replace(/ /g, ',').split(',')
                const contour = []
                for (let i=0; i < nums.length;i+=2) {
                    contour.push([parseFloat(nums[i]), parseFloat(nums[i+1])])
                }
                return {contour, min_tt: obj.min_tt, sourceid: obj.sourceid}
            })
         }
        res.send({businesses, polygons})
    }).catch(e => {
        console.log(e)
    })
})

app.listen(8080, () => console.log('Listening on port 8080!'));

