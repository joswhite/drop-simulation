import React from 'react';
import '@microfocus/ux-ias/dist/ux-ias.css';
import './App.css';

import {DropSimulator} from './webgl/DropSimulator';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Gravity Simulator</h1>
      </header>
      <DropSimulator />
    </div>
  );
}

export default App;
