import * as clipbard from 'clipboardy';
import { Server as HapiServer } from '@hapi/hapi';

const INTERVAL = 500;
const PORT = 4444;
const MAX_ITEMS = 100;

class Clipboard {
  private items = [];
  private clearIntervalId: NodeJS.Timeout;

  constructor(private interval = INTERVAL) {}

  getItems = () => {
    return this.items;
  };

  setItems = (item: any) => {
    this.items.push(item);
    if (this.items.length > MAX_ITEMS) {
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
    clearInterval(this.clearIntervalId);
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
      port: PORT,
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

  start = () => {
    this.clipboard.startListener();
    this.registerRoutes();
    this.server.start();
  };

  stop = () => {
    this.clipboard.stopListener();
    this.server.start();
  };
}

const init = () => {
  const clipboard = new Clipboard();
  const server = new Server(clipboard);
  server.start();
};

init();
