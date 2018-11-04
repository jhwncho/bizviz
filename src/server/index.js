const express = require('express');
const os = require('os');

const app = express();
const yelp = require('yelp-fusion');
const client = yelp.client('SfWxRRxbB6yzezKqksOZ5dIND3mI8FZNJigXhI62tFcvvy9Z8IHOpL6Pc4KCVYKvnXZR_zTPV9c6EI467UXzNSRS02KoKCG6tqQsDpZTtjKKyzw4fC-uDyvme43eW3Yx');


app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => {
    res.send({username: os.userInfo().username }) 
    console.log('Username: ', os.userInfo().username)
});

/* Response = {
    businesses: [{name: , latitude, longitude}]
}

*/ 
app.get('/api/businessSearch/:category', (req, res)=> {
    console.log('Params: ', req.params)
    client.search({
        categories: req.params.category,
        latitude: 37.867894,
        longitude: -122.257867,
        limit: 50
    }).then(yelpResponse => {
        const body = JSON.parse(yelpResponse.body)
        let businesses = []
        for (let business of body.businesses) {
            const {latitude, longitude} = business.coordinates
            businesses.push({name: business.name, latitude, longitude})
        }
        res.send({businesses})
        console.log(businesses)
    }).catch(e => {
        console.log(e)
    })
})
app.listen(8080, () => console.log('Listening on port 8080!'));
