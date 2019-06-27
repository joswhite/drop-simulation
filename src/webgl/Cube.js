const X_INDEX = 0;
const Y_INDEX = 1;
const Z_INDEX = 2;

export class Cube {
    constructor(gl, position, velocity, gravity, hexColor) {
        this.gl = gl;
        this.color = this.hexToColor(hexColor);
        this.initBuffers();
        this.position = position;
        this.velocity = velocity;
        this.gravity = gravity;
        this.rotation = 0;  // radians
    }

    getBuffers() {
        return this.buffers;
    }

    getPosition() {
        return this.position;
    }

    getRotation() {
        return this.rotation;
    }

    hexToColor(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 256,
            g: parseInt(result[2], 16) / 256,
            b: parseInt(result[3], 16) / 256
        } : null;
    }

    initBuffers() {
        const {gl} = this;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        let faceColors = [];
        for (let i = 0; i < 6; i++) {
            const r = this.randomColorOffset(this.color.r);
            const g = this.randomColorOffset(this.color.g);
            const b = this.randomColorOffset(this.color.b);
            faceColors.push([r,  g,  b,  1.0]);
        }

        let colors = [];
        for (let j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            colors = colors.concat(c, c, c, c); // Repeat 4 times for 4 vertices
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // Build the element array buffer; this specifies the indices into the vertex arrays for each face's vertices.
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // Define each face as two triangles, using the indices into the vertex array to specify each triangle's
        // position.
        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.buffers = {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
        };
    }

    isVisible() {
        const [x, y, z] = this.position;
        if (z > 1 || y < -7) {
            return false;
        }

        return (x * x) + (y * y) + (z * z) < 1000;
    }

    move(deltaTime) {
        this.velocity[Y_INDEX] -= (this.gravity * deltaTime);
        this.velocity.forEach((speed, index) => {
            this.position[index] += (speed * deltaTime);
        });
        this.rotation += deltaTime;
    }

    randomColorOffset(color) {
        const newColor = color + (Math.random() - .5);
        if (newColor > 1) {
            return 1;
        }
        else if (newColor < 0) {
            return 0;
        }
        else {
            return newColor;
        }
    }
}
