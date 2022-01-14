import {RedisClientType} from "redis";
import {ChildProcess} from "child_process";
import {startExternalService, startRestService} from './utils';

const axios = require('axios');
const {createClient} = require("redis");

const port = 5555;

describe('application', () => {
  let client: RedisClientType<any, any>;
  const applications: ChildProcess[] = [];

  beforeAll(async () => {
    client = createClient();
    await client.connect();
    const apps = await Promise.all([
      startExternalService(),
      startRestService('5555')
    ]);
    applications.push(...apps);
  });

  afterAll(async () => {
    await client.disconnect();
    applications.forEach(app => app.kill());
  });

  beforeEach(async () => {
    await client.flushDb();
  });

  it('should work', async () => {
    const {data: price} = await axios.get(`http://localhost:${port}/price/888`);

    expect(price).toEqual(9999);
  });

  it('should call to external api a single time in a single instance', async () => {
    const numberPlate = '2567';

    await Promise.all([
      axios.get(`http://localhost:${port}/price/${numberPlate}`),
      new Promise((res) => {
        setTimeout(async () => {
          await axios.get(`http://localhost:${port}/price/${numberPlate}`);
          res('');
        }, 1000);
      }),
      new Promise((res) => {
        setTimeout(async () => {
          await axios.get(`http://localhost:${port}/price/${numberPlate}`);
          res('');
        }, 1000);
      })
    ]);

    const apiCalls = await client.get(`request_${numberPlate}_calls`);
    const externalCalls = await client.get(`request_${numberPlate}_external_calls`);

    expect(apiCalls).not.toBeNull();
    expect(externalCalls).not.toBeNull();
    expect(+apiCalls!).toEqual(3);
    expect(+externalCalls!).toEqual(1);
  })

  it('should call to external api a single time to separate instances', async () => {
    const secondAppPort = '7777';
    const app = await startRestService(secondAppPort);
    const numberPlate = '1234';

    await Promise.all([
      axios.get(`http://localhost:${port}/price/${numberPlate}`),
      new Promise((res) => {
        setTimeout(async () => {
          await axios.get(`http://localhost:${secondAppPort}/price/${numberPlate}`);
          res('');
        }, 1000);
      })
    ]);

    try {
      app.kill('SIGINT');
    } catch (e) {

    }

    const apiCalls = await client.get(`request_${numberPlate}_calls`);
    const externalCalls = await client.get(`request_${numberPlate}_external_calls`);

    expect(apiCalls).not.toBeNull();
    expect(externalCalls).not.toBeNull();
    expect(+apiCalls!).toEqual(2);
    expect(+externalCalls!).toEqual(1);
  })
})
