import axios from 'axios';
import {createClient, RedisClientType} from 'redis';

export class CarService {
  private static instance: CarService;
  private cacheClient: RedisClientType<any, any>;
  private channelClient: RedisClientType<any, any>;

  private constructor() {
    this.cacheClient = createClient();
    this.channelClient = createClient();
    process.nextTick(async () => {
      await this.cacheClient.connect();
      console.log('cache client connected');
      await this.channelClient.connect();
      console.log('pub/sub client connected');
    })
  }

  static getInstance() {
    if (!CarService.instance) {
      CarService.instance = new CarService();
    }
    return CarService.instance;
  }

  async getPrice(numberPlate: string, skipCacheForRead = true) {
    if (!skipCacheForRead) {
      const price = await this.cacheClient.get(numberPlate)
      if (price) return price;
    }
    const price = await this.getExternalPrice(numberPlate);

    await Promise.all([
      this.cacheClient.set(numberPlate, price),
      this.cacheClient.incr(`request_${numberPlate}_calls`),
    ]);

    return price;
  }

  private getExternalPrice(numberPlate: string): Promise<string> {
    return new Promise(async (res) => {
      if (!!(await this.cacheClient.exists(`request_for_${numberPlate}`))) {
        console.log(`request indicator for plate ${numberPlate} exists.subscribe.`);
        await this.channelClient.subscribe(`request_for_${numberPlate}`, async (message) => {
          console.log(`message for request for plate ${numberPlate}. price: `, message);
          await this.channelClient.unsubscribe(`request_for_${numberPlate}`);
          console.log(`unsubscribed from channel for plate ${numberPlate}`);
          res(message);
        });
      } else {
        console.log(`request indicator for plate ${numberPlate} not exists. set value`);
        await this.cacheClient.set(`request_for_${numberPlate}`, '1');

        const {data: price} = await axios.get(`http://localhost:4444/price/${numberPlate}`);
        console.log(`price for plate ${numberPlate}: ${price}`);

        console.log(`set value of external calls counter for plate ${numberPlate}`);
        await this.cacheClient.incr(`request_${numberPlate}_external_calls`);

        console.log(`publish price`);
        await this.channelClient.publish(`request_for_${numberPlate}`, '' + price);

        console.log(`delete request indicator for plate ${numberPlate}`);
        await this.cacheClient.del(`request_for_${numberPlate}`);

        console.log(`set expiration for value of external calls counter for plate ${numberPlate}`);
        await this.cacheClient.expire(`request_${numberPlate}_external_calls`, 20);

        res(price);
      }
    });
  }
}
