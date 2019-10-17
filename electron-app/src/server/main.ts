import * as clipbard from 'clipboardy';
import { Server as HapiServer } from '@hapi/hapi';
import {
  CLIPBOARD_POLL_INTERVAL,
  SERVER_PORT,
  CLIPBOARD_MAX_ITEMS,
} from '../constants';

class Clipboard {
  private items: String[] = [];
  private clearIntervalId?: NodeJS.Timeout;

  constructor(private interval = CLIPBOARD_POLL_INTERVAL) {}

  getItems = () => {
    return this.items;
  };

  setItems = (item: string) => {
    this.items.push(item);
    if (this.items.length > CLIPBOARD_MAX_ITEMS) {
      this.items.pop();
    }
  };

  startListener = () => {
    this.clearIntervalId = setInterval(() => {
      const latest = clipbard.readSync();

      if (this.items[this.items.length - 1] !== latest) {
        this.setItems(latest);
      }
    }, this.interval);
  };

  stopListener = () => {
    this.items = [];
    clearInterval(this.clearIntervalId!);
  };
}

class Server {
  server: HapiServer;

  constructor(private clipboard: Clipboard) {
    this.server = this.createServer();
    process.on('unhandledRejection', () => {
      this.stop();
    });
  }

  createServer = () => {
    return new HapiServer({
      port: SERVER_PORT,
      host: 'localhost',
    });
  };

  registerRoutes = () => {
    this.server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return this.clipboard.getItems();
      },
    });
  };

  start = async () => {
    this.clipboard.startListener();
    this.registerRoutes();
    await this.server.start();
  };

  stop = async () => {
    this.clipboard.stopListener();
    await this.server.stop();
  };
}

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
