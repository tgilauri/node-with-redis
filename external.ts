import express from "express";

const app = express();
const timeout = 1_000;

app.get('/price/:numberPlate', async (req, res) => {
    console.log('get price request for number plate: ', req.params['numberPlate']);
    setTimeout(() => {
        res.status(200)
            .setHeader('Content-Type', 'plain/text')
            .send('' + 9999);
    }, timeout);
})


app.listen(4444, () => {
    console.log('listen on port 4444');
})
