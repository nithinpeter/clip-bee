import { Clipboard } from './clipboard';
import { Server } from './server';

let server: Server;
export const start = async () => {
  const clipboard = new Clipboard();
  server = new Server(clipboard);
  await server.start();
};

export const stop = async () => {
  if (server) {
    await server.stop();
  }
};
