import React from 'react';
import './App.css';
import {WebGLComponent} from './webgl/WebGLComponent';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Gravity Simulator</h1>
      </header>
      <WebGLComponent />
    </div>
  );
}

export default App;
