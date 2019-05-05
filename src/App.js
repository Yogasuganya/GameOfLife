import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Game from './Game';

class App extends Component {
  render() {
    return (
      <div className = "App" >
        <h1 className = "title">{"Conway's Game of Life"} </h1>
        <Game />
      </div>
    );
  }
}

export default App;
