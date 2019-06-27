import { mat4 } from 'gl-matrix';
import { ShaderProgram } from './ShaderProgram';
import {Cube} from './Cube';
import {Ground} from './Ground';

export class Simulator {
    constructor(gl, setError) {
        this.gl = gl;
        this.setError = setError;
        this.program = new ShaderProgram(gl, setError);
        this.programInfo = this.program.getProgramInfo();
        this.cubes = [
            new Cube(gl, 1),
            new Cube(gl, -1)
        ];
        this.ground = new Ground(gl);
        this.lastRenderTime = null;
        this.setNextRender();
    }

    createCube(args) {
        this.cubes.push(new Cube(this.gl, args));
    }

    drawCube(cube, projectionMatrix) {
        const {gl, programInfo} = this;
        // Create matrix to draw cube in proper position
        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, cube.getPosition());
        const cubeRotation = cube.getRotation();
        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * .7, [1, 1, 0]);

        // Setup buffers
        const buffers = cube.getBuffers();
        const {vertexPosition, vertexColor} = programInfo.attribLocations;
        this.setupBuffer(3, buffers.position, vertexPosition);
        this.setupBuffer(4, buffers.color, vertexColor);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Draw using program
        gl.useProgram(programInfo.program);
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }

    drawGround(projectionMatrix) {
        const {gl, programInfo} = this;
        // Create matrix to draw ground in proper position
        const modelViewMatrix = mat4.create();

        // Setup buffers
        const buffers = this.ground.getBuffers();
        const {vertexPosition, vertexColor} = programInfo.attribLocations;
        this.setupBuffer(3, buffers.position, vertexPosition);
        this.setupBuffer(4, buffers.color, vertexColor);

        // Draw using program
        gl.useProgram(programInfo.program);
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    drawScene() {
        const {gl} = this;

        // Clear canvas to full black
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create perspective matrix to simulate the distortion of perspective in a camera
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        // Draw cubes
        this.cubes.forEach((cube) => {
            this.drawCube(cube, projectionMatrix);
        });

        // Draw ground
        this.drawGround(projectionMatrix);
    }

    render = (time) => {
        if (this.lastRenderTime) {
            const deltaTime = (time - this.lastRenderTime) / 1000;
            this.cubes.forEach((cube) => {
                cube.move(deltaTime)
            });

            this.cubes = this.cubes.filter(cube => cube.isVisible());
        }
        this.lastRenderTime = time;
        this.drawScene();
        this.setNextRender();
    };

    setNextRender = () => {
        requestAnimationFrame(this.render);
    };

    setupBuffer(numComponents, buffer, vertex) {
        const {gl} = this;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(vertex, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(vertex);
    }
}
