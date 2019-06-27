import React, { useEffect, useRef, useState } from 'react';
import {Simulator} from './Simulator';

export function DropSimulator() {
    // Inputs for creating cube
    const [error, setError] = useState(null);
    const [cubeX, setCubeX] = useState(-4);
    const [cubeY, setCubeY] = useState(-4);
    const [cubeZ, setCubeZ] = useState(-4);
    const [cubeVX, setCubeVX] = useState(-4);
    const [cubeVY, setCubeVY] = useState(-4);
    const [cubeVZ, setCubeVZ] = useState(-4);
    const [gravity, setGravity] = useState(9.81);
    const inputsGrid = [
        [ { id: 'posX', value: cubeX, onChange: (e) => setCubeX(e.target.value)},
          { id: 'posY', value: cubeY, onChange: (e) => setCubeY(e.target.value)},
          { id: 'posZ', value: cubeZ, onChange: (e) => setCubeZ(e.target.value)} ],
        [ { id: 'speedX', value: cubeVX, onChange: (e) => setCubeVX(e.target.value)},
          { id: 'speedY', value: cubeVY, onChange: (e) => setCubeVY(e.target.value)},
          { id: 'speedZ', value: cubeVZ, onChange: (e) => setCubeVZ(e.target.value)} ],
        [ { id: 'gravity', value: gravity, onChange: (e) => setGravity(e.target.value)} ]
    ];

    // Initialize WebGL to a black screen and start up simulator
    const canvasRef = useRef(null);
    let simulator;
    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');

        if (gl === null) {
            setError('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        simulator = new Simulator(gl, setError);
    }, []);

    // Handle to create cube
    const createCube = () => {
        simulator.createCube([cubeX, cubeY, cubeZ], [cubeVX, cubeVY, cubeVZ], gravity);
    };

    // Render
    const errorElement = error ? <p className="error">{error}</p> : null;

    const inputElements = inputsGrid.map((inputs, index) => {
        const inputElements = inputs.map((input) => {
            return (
                <div className="ias-input-container" key={input.id}>
                    <label htmlFor={input.id}>{input.id}</label>
                    <input type="text" {...input} autoComplete="off" />
                </div>
            )
        });

        return (
            <div className="input-panel" key={'panel' + index}>
                {inputElements}
            </div>
        );
    });

    return (
        <div>
            {errorElement}

            <canvas ref={canvasRef} width="640" height="480" />
            <p>Create a new Cube</p>
            {inputElements}
            <div className="section">
                <button type="button" onClick={createCube} className="ias-button">Create Cube!</button>
            </div>
        </div>
    );
}
