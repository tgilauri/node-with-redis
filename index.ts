import {config} from "dotenv";
import express from "express";
import {CarService} from "./CarService";

config();

const app = express();
const carService = CarService.getInstance();
const skipCache = !(process.env.USE_CACHE && process.env.USE_CACHE === 'true');

app.get('/price/:numberPlate', async (req, res) => {
  const price = await carService.getPrice(req.params['numberPlate'], skipCache);
  res.status(200)
    .setHeader('Content-Type', 'plain/text')
    .send('' + price);
})

console.log('port :', process.env.PORT);

process.nextTick(() => {
  console.log('start listen');

  app.listen(process.env.PORT, () => {
    console.log(`listen on port ${process.env.PORT}`);

    if (process.send) {
      console.log('process is fork');
      process.send('ready')
    }
  });
});
