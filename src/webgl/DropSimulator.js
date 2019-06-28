import React, { useEffect, useRef, useState } from 'react';
import {Simulator} from './Simulator';

//
export function DropSimulator() {
    // Inputs used for creating cube
    const [error, setError] = useState(null);
    const [cubeX, setCubeX] = useState(-10);
    const [cubeY, setCubeY] = useState(8);
    const [cubeZ, setCubeZ] = useState(-25);
    const [cubeVX, setCubeVX] = useState(7);
    const [cubeVY, setCubeVY] = useState(5);
    const [cubeVZ, setCubeVZ] = useState(.1);
    const [gravity, setGravity] = useState(9);
    const [hexColor, setHexColor] = useState('#0095FF');
    const inputsGrid = [
        [ { id: 'posX', value: cubeX, onChange: (e) => setCubeX(e.target.value)},
          { id: 'posY', value: cubeY, onChange: (e) => setCubeY(e.target.value)},
          { id: 'posZ', value: cubeZ, onChange: (e) => setCubeZ(e.target.value)} ],
        [ { id: 'speedX', value: cubeVX, onChange: (e) => setCubeVX(e.target.value)},
          { id: 'speedY', value: cubeVY, onChange: (e) => setCubeVY(e.target.value)},
          { id: 'speedZ', value: cubeVZ, onChange: (e) => setCubeVZ(e.target.value)} ],
        [ { id: 'gravity', value: gravity, onChange: (e) => setGravity(e.target.value)},
          { id: 'hexColor', value: hexColor, onChange: (e) => setHexColor(e.target.value)} ]
    ];

    // Keep track of simulator so we can perform operations on it
    const simulatorRef = useRef(null);

    // Allow user to create cube
    const parseInput = (x) => parseInt(x);
    const dropCube = () => {
        const position = [cubeX, cubeY, cubeZ].map(parseInput);
        const velocity = [cubeVX, cubeVY, cubeVZ].map(parseInput);
        simulatorRef.current.dropCube(position, velocity, parseInput(gravity), hexColor);
    };

    // Allow user to play/pause animation
    const startStopSimulation = () => {
        simulatorRef.current.playOrPause();
    };

    // Initialize WebGL to a black screen and start up simulator
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');

        if (gl === null) {
            setError('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        simulatorRef.current = new Simulator(gl, setError);
        dropCube();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render WebGL canvas, inputs, and control buttons
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
            <p>Drop a new Cube</p>
            {inputElements}
            <div className="section">
                <button type="button" onClick={dropCube} className="ias-button">Drop Cube!</button>
            </div>
            <div className="section">
                <button type="button" onClick={startStopSimulation} className="ias-button">Play/Pause</button>
            </div>
        </div>
    );
}
