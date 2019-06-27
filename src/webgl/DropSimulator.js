import React, { useEffect, useRef, useState } from 'react';

export function DropSimulator() {
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);

    // Initialize WebGL to a black screen
    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');

        if (gl === null) {
            setError('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }, []);

    const errorElement = error ? <p className="error">{error}</p> : null;

    return (
        <div>
            {errorElement}
            <canvas ref={canvasRef} width="640" height="480" />
        </div>
    );
}
