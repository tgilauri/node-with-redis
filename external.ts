import express from "express";

const app = express();
const timeout = 5_000;

app.get('/price/:numberPlate', async (req, res) => {
  console.log('get price request for number plate: ', req.params['numberPlate']);
  setTimeout(() => {
    res.status(200)
      .setHeader('Content-Type', 'plain/text')
      .send('' + 9999);
  }, timeout);
})


app.listen(process.env.PORT, () => {
  console.log('listen on port ', process.env.PORT);
  if (process.send) {
    process.send('ready')
  }
})
