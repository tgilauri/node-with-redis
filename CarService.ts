import axios from 'axios';
import {createClient, RedisClientType} from 'redis';

export class CarService {
    private static instance: CarService;
    private cacheClient: RedisClientType<any, any>;

    private constructor() {
        this.cacheClient = createClient();
        process.nextTick(async () => {
            await this.cacheClient.connect();
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
        const price = await CarService.getExternalPrice(numberPlate);

        await this.cacheClient.set(numberPlate, price);

        return price;
    }

    private static async getExternalPrice(numberPlate: string): Promise<string> {
        const {data} = await axios.get(`http://localhost:4444/price/${numberPlate}`);

        return data;
    }
}
