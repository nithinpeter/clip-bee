import * as clipbard from 'clipboardy';

import { CLIPBOARD_POLL_INTERVAL, CLIPBOARD_MAX_ITEMS } from '../../constants';

export class Clipboard {
  private items: String[] = [];
  private clearIntervalId?: NodeJS.Timeout;

  constructor(private interval = CLIPBOARD_POLL_INTERVAL) {}

  getItems = () => {
    return this.items;
  };

  setItems = (item: string) => {
    this.items.unshift(item);
    if (this.items.length > CLIPBOARD_MAX_ITEMS) {
      this.items.pop();
    }
  };

  removeItem = (index: number) => {
    this.items.splice(index, 1);
    // if it is the first item remove it also the system clipboard as well,
    // so that we won't re-read it.
    if (index === 0) {
      clipbard.writeSync('');
    }
  };

  startListener = () => {
    this.clearIntervalId = setInterval(() => {
      const latest = clipbard.readSync();

      if (latest && this.items[0] !== latest) {
        this.setItems(latest);
      }
    }, this.interval);
  };

  stopListener = () => {
    this.items = [];
    clearInterval(this.clearIntervalId!);
  };
}
