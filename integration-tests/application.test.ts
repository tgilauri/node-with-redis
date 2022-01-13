import axios from 'axios';
import {createClient, RedisClientType} from "redis";

const port = 5555;

describe('application', () => {
  let client: RedisClientType<any, any>;

  beforeAll(async () => {
    client = createClient();
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  beforeEach(async () => {
    await client.flushDb();
  });

  it('should work', async () => {
    const {data: price} = await axios.get(`http://localhost:${port}/price/888`);

    expect(price).toEqual(9999);
  });

  it('should call to external api a single time', async () => {
    const numberPlate = 777;

    await Promise.all([
      axios.get(`http://localhost:${5555}/price/${numberPlate}`),
      new Promise((res) => {
        setTimeout(async () => {
          await axios.get(`http://localhost:${6666}/price/${numberPlate}`);
          res('');
        }, 2000);
      })
    ]);

    const apiCalls = await client.get(`request_${numberPlate}_calls`);
    const externalCalls = await client.get(`request_${numberPlate}_external_calls`);

    expect(apiCalls).not.toBeNull();
    expect(externalCalls).not.toBeNull();
    expect(+apiCalls!).toEqual(2);
    expect(+externalCalls!).toEqual(1);
  })
})