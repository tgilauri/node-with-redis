import {ChildProcess, fork} from "child_process";
import {join} from "path";

const startApplication = (port: string, appPath: string): Promise<ChildProcess> => {
  const tsNodePath = join(process.cwd(), 'node_modules', '.bin', 'ts-node')

  return new Promise((res, rej) => {
    console.log('start application on port ', port);

    const subprocess = fork(appPath, {
      execArgv: [tsNodePath],
      env: {
        PORT: port,
      }
    });

    subprocess.on('message', function (message: string) {
      console.log('message from child: ', message);
      if (message === 'ready') {
        console.log('process is ready');
        res(subprocess);
      } else {
        rej();
      }
    });

    subprocess.on('error', function (error: Error) {
      console.log('error while starting application. exit.')
      console.log(error);
      rej(error);
    });
  })
}

export const startRestService = (port: string) => {
  const appPath = join(process.cwd(), 'index.ts');

  return startApplication(port, appPath);
}

export const startExternalService = () => {
  const appPath = join(process.cwd(), 'external.ts');

  return startApplication('4444', appPath);
}
