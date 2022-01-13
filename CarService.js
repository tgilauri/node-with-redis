module.exports.CarService = class CarService {

    #cache = new Map();

    async getPrice(numberPlate, skipCacheForRead = true) {
        if(!skipCacheForRead && this.#cache.has(numberPlate)) {
            return this.#cache.get(numberPlate);
        }
        const price = await this.#getExternalPrice(numberPlate);

        this.#cache.set(numberPlate, price);

        return price;
    }

    async #getExternalPrice(numberPlate) {
        return 500;
    }
}
