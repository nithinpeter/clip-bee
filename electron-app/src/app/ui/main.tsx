import 'babel-polyfill';
import * as React from 'react';
import * as ReactDom from 'react-dom';

import { SERVER_PORT, SERVER_HOST } from '../../constants';
// @ts-ignore
import logo from './logo.png';

const API_BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}/api`;

const Api = {
  getItems: async () => {
    const res = await fetch(API_BASE_URL + '/items');
    const data = await res.json();
    return data;
  },
  deleteItem: async (index: number) => {
    const res = await fetch(API_BASE_URL + '/items/' + index, {
      method: 'DELETE',
    });
    const data = await res.json();
    return data;
  },
};

type State = {
  items: string[];
};

export class App extends React.Component<{}, State> {
  state = {
    items: [],
  };
  componentDidMount() {
    this.setItems();
  }

  setItems = async () => {
    const items = await Api.getItems();
    this.setState({
      items,
    });
  };

  copyToClipboard = async (item: string) => {
    await navigator.clipboard.writeText(item);
  };

  handleDelete = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();

    const res = await Api.deleteItem(index);
    if (res.ok) {
      this.setItems();
    }
  };

  render() {
    return (
      <div className="container">
        <div className="header">
          <img src={logo} />
          <h1 className="header__logo">ClipBee</h1>
        </div>

        <ul className="list">
          {this.state.items.map((item, index) => {
            return (
              <li key={index} className="list__item">
                <pre className="list__item__text">{item}</pre>
                <div className="list__item__actions">
                  <button onClick={e => this.handleDelete(e, index)}>
                    delete
                  </button>
                  <button onClick={() => this.copyToClipboard(item)}>
                    copy
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById('root'));
