import React, { useEffect } from 'react';
import {initBuffers, initShaderProgram, initTexture, updateTexture} from './webgl.utils';
import { mat4 } from 'gl-matrix';

// MDN tutorial of WebGL using React Hooks.

export function WebGLComponent() {
    useEffect(() => {
        const canvas = document.querySelector('#glCanvas');
        const gl = canvas.getContext('webgl');
        if (gl === null) {
            alert('Unable to initialize WebGL. Try another browser. IE is not supported');
            return;
        }

        // Clear screen (black)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Vertex and fragment shader programs
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;
            attribute vec2 aTextureCoord;
        
            uniform mat4 uNormalMatrix;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;
        
            void main(void) {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
              vTextureCoord = aTextureCoord;
        
              // Apply lighting effect
        
              highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
              highp vec3 directionalLightColor = vec3(1, 1, 1);
              highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
        
              highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
        
              highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
              vLighting = ambientLight + (directionalLightColor * directional);
            }
          `;

        const fsSource = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;
        
            uniform sampler2D uSampler;
        
            void main(void) {
              highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
        
              gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
            }
          `;

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        };

        const buffers = initBuffers(gl);

        // will set to true when video can be copied to texture
        var copyVideo = false;

        function setupVideo(url) {
            const video = document.createElement('video');

            var playing = false;
            var timeupdate = false;

            video.autoplay = true;
            video.muted = true;
            video.loop = true;

            // Waiting for these 2 events ensures
            // there is data in the video

            video.addEventListener('playing', function() {
                playing = true;
                checkReady();
            }, true);

            video.addEventListener('timeupdate', function() {
                timeupdate = true;
                checkReady();
            }, true);

            video.src = url;
            video.play();

            function checkReady() {
                if (playing && timeupdate) {
                    copyVideo = true;
                }
            }

            return video;
        }

        // Load texture
        const texture = initTexture(gl);
        const video = setupVideo('Firefox.mp4');

        let cubeRotation = 0;
        let then = 0;
        function render(now) {
            now *= .001;
            const deltaTime = now - then;
            cubeRotation += deltaTime;
            then = now;

            if (copyVideo) {
                updateTexture(gl, texture, video);
            }

            const dist = (Math.abs(5 - (cubeRotation % 10)) * 4) + 4;
            drawScene(gl, programInfo, buffers, texture, cubeRotation, dist);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);

    });

    return (
        <React.Fragment>
            <p>This is a WebGL Canvas</p>
            <canvas id="glCanvas" width="640" height="480" />
        </React.Fragment>
    );
}

function drawScene(gl, programInfo, buffers, texture, cubeRotation, dist) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);              // everything
    gl.enable(gl.DEPTH_TEST);               // enable depth testing
    gl.depthFunc(gl.LEQUAL);                // near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT); // clear canvas

    // Create perspective matrix that will be used to simulate the distortion of perspective in a camera
    // Includes 45 degree field of view, same aspect ratio as canvas, and shows only objects .1-100 units away
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Sets drawing position to center of scene ("identity point"), then move away from camera to starting square point
    // Originally dist was hardcoded to 6.
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -dist]);

    // Rotate by cubeRotation rads around 0,0,1 axis (i.e. away/towards camera)
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
    // Cube rotation around x axis
    mat4.rotate(modelViewMatrix, modelViewMatrix, Math.cos(cubeRotation) * 3, [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, Math.sin(cubeRotation) * 2, [1, 0, 0]);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tells WebGL how to pull out positions from the position buffer into the vertexPosition attribute
    {
        const numComponents = 3;    // 4 values/iteration
        const type = gl.FLOAT;      // buffer data
        const normalize = false;
        const stride = 0;           // num bytes from 1 set of values to next (0 means use type and numComponents)
        const offset = 0;           // num bytes inside buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,
            numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // tell webgl how to pull out the texture coordinates from buffer
    {
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32 bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set program to use & shader uniforms
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}