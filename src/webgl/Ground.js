export class Ground {
    constructor(gl) {
        this.gl = gl;
        this.initBuffers();
    }

    getBuffers() {
        return this.buffers;
    }

    initBuffers() {
        const {gl} = this;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            10.0, -10, -25.0,
            -10.0, -10, -25.0,
            2.0, -10, -40.0,
            -2.0, -10, -40.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const color = [0.0,  1.0,  0.5,  0.8];
        let colors = [];
        for (let i = 0; i < 4; i++) {
            colors = colors.concat(color);
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        this.buffers = {
            position: positionBuffer,
            color: colorBuffer,
        };
    }
}
