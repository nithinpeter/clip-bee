import { app, shell } from 'electron';

import { init as serverInit } from './server/main';
import { SERVER_PORT } from './constants';

app.on('ready', async () => {
  await serverInit();
  shell.openExternal('http://localhost:' + SERVER_PORT);
});
