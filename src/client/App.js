import React, { Component } from 'react';
import './app.css';
import ReactImage from './react.png';
import { runInThisContext } from 'vm';

export default class App extends Component {
  state = { username: null };

  async componentDidMount() {
    const res = await fetch('/api/getUsername');
    if (res) {
      const resJson = await res.json();
      this.setState(resJson);
    }
  }

  render() {
    const { username } = this.state;
    return (
      <div>
        <h1>Sup Bitches</h1>
        {username ? <h2> Fuck you {username} </h2> : null }
      </div>
    );
  }
}
