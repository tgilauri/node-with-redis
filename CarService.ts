import redis from 'redis';

export class CarService {
    private static instance;
    private cache;

    private constructor() {
        this.cache = redis.createClient();
    }

    static getInstance() {
        if (!CarService.instance) {
            CarService.instance = new CarService();
        }
        return CarService.instance;
    }

    async getPrice(numberPlate, skipCacheForRead = true) {
        if (!skipCacheForRead && this.cache.exists(numberPlate)) {
            return this.cache.get(numberPlate);
        }
        const price = await this.getExternalPrice(numberPlate);

        this.cache.set(numberPlate, price);

        return price;
    }

    private async getExternalPrice(numberPlate) {
        return 500;
    }
}
