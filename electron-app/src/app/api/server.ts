import * as path from 'path';
import { Server as HapiServer } from '@hapi/hapi';
import * as Inert from '@hapi/inert';

import { SERVER_PORT } from '../../constants';
import { Clipboard } from './clipboard';

const STATIC = path.join(__dirname, '../ui');

export class Server {
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
      routes: {
        files: {
          relativeTo: STATIC,
        },
      },
    });
  };

  registerRoutes = async () => {
    await this.server.register(Inert);
    this.server.route([
      // Static files
      {
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: '.',
            redirectToSlash: true,
            index: true,
          },
        },
      },
      // APIs
      {
        method: 'GET',
        path: '/api/items',
        handler: (request, h) => {
          return this.clipboard.getItems();
        },
      },
      {
        method: 'DELETE',
        path: '/api/items/{index}',
        handler: (request, h) => {
          const { index } = request.params || {};
          this.clipboard.removeItem(parseInt(index));
          return { ok: true };
        },
      },
    ]);
  };

  start = async () => {
    this.clipboard.startListener();

    await this.registerRoutes();
    await this.server.start();
  };

  stop = async () => {
    this.clipboard.stopListener();
    await this.server.stop();
  };
}
