const {parsed: env} = require('dotenv').config();
const express = require('express');
const {CarService} = require('./CarService');


const app = express();
const carService = new CarService();
const skipCache = !(env.USE_CACHE && env.USE_CACHE === true);

app.get('/price/:numberPlate', async (req, res) => {
    const price = await carService.getPrice(req.params['numberPlate'], skipCache);
    res.status(200)
        .setHeader('Content-Type', 'plain/text')
        .send(''+price);
})


app.listen(env.PORT, () => {
    console.log('listen on port ', env.PORT);
})
