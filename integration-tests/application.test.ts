import {RedisClientType} from "redis";
import {ChildProcess} from "child_process";

const axios = require('axios');
const {createClient} = require("redis");
const {fork} = require("child_process");
const {join} = require("path");

const port = 5555;

const startApplication = (port: string, appPath: string): Promise<ChildProcess> => {
  const tsNodePath = join(process.cwd(), 'node_modules', '.bin', 'ts-node')
  console.log('app path', appPath);
  return new Promise((res) => {
    console.log('start application on port ', port);
    const subprocess = fork(appPath, {
      execArgv: [tsNodePath],
      env: {
        PORT: port,
      }
    }).on('message', function (message: string) {
      console.log(message);
      if (message === 'ready') {
        res(subprocess);
      }
    }).on('error', function (error: Error) {
      console.log('error while starting application. exit.')
      console.log(error);
      process.exit(1);
    });
  })
}

const startRestService = (port: string) => {
  const appPath = join(process.cwd(), 'index.ts');

  return startApplication(port, appPath);
}

const startExternalService = () => {
  const appPath = join(process.cwd(), 'external.ts');

  return startApplication('4444', appPath);
}

describe('application', () => {
  let client: RedisClientType<any, any>;
  const applications: ChildProcess[] = [];

  beforeAll(async () => {
    client = createClient();
    await client.connect();
    const apps = await Promise.all([
      startExternalService(),
      startRestService('5555'),
      startRestService('6666'),
    ])
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
