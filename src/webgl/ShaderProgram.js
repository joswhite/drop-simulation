// Compiles and loads shader programs, which are programs written in OpenGL ES Shading language that take
// information about vertices for a shape and generate the data needed to render pixels on the screen
export class ShaderProgram {
    constructor(gl, setError) {
        this.gl = gl;
        this.setError = setError;

        // Create program
        const vertexShaderSource = this.getVertexShaderSource();
        const fragmentShaderSource = this.getFragmentShaderSource();
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        // Check for errors
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(this.shaderProgram);
            setError('Unable to initialize the shader program: ' + info);
            this.shaderProgram = null;
        }

        // Store program info to be used during drawing
        this.programInfo = {
            program: this.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(this.shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
            },
        };
    }

    // Show the color of the object without lighting effects
    getFragmentShaderSource() {
        return `
            varying lowp vec4 vColor;

            void main(void) {
                gl_FragColor = vColor;
            }
        `;
    }

    getProgramInfo() {
        return this.programInfo;
    }

    // Calculate WebGL position of objects based on camera, location of object, and position of its vertices
    getVertexShaderSource() {
        return `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
        
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            varying lowp vec4 vColor;
        
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;
    }

    loadShader(shaderType, source) {
        const shader = this.gl.createShader(shaderType);

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.setError('An error occurred compiling the shaders: ' + info);
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
