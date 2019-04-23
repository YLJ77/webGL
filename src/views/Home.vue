<template>
    <canvas id="webgl" width="400" height="400"
            @keydown="onKeydown"
            @mousedown="onMousedown"
            @mousemove="onMousemove"
            @mouseup="onMouseup"
            tabindex="1">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { Vector3, createProgram, windowToCanvas, initVertexBuffers } from "../util/appFunc";
    import { Matrix4 } from "../util/Matrix4";

    export default {
        data() {
            return {
                lookAt: {
                    eye: {
                        x: 20,
                        y: 10,
                        z: 30
                    },
                    look: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    up: {
                        x: 0,
                        y: 1,
                        z: 0
                    }
                },
                canvas: null,
                gl: null,
                g_points: [],
                program: null,
                shape: null,
                VSHADER_SOURCE:
                    'uniform mat4 u_MvpMatrix;\n' +
                    'uniform mat4 u_ModelMatrix;\n' + // Model matrix
                    'uniform mat4 u_NormalMatrix;\n'+ // Transformation matrix of normal
                    'attribute vec4 a_Normal;\n' + // Normal
                    'uniform vec3 u_LightColor;\n' + // Light color
                    'uniform vec3 u_LightDirection;\n' + // world coordinate, normalized
                    'uniform vec3 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
                    'uniform vec3 u_AmbientLight;\n' + // Color of an ambient light
                    'attribute vec4 a_Position;\n' +
                    'attribute float a_PointSize;\n' +
                    'attribute vec4 a_Color;\n' +
                    'varying vec4 v_Color;\n' + // varying variable
                    'varying vec3 v_Normal;\n' +
                    'varying vec3 v_Position;\n' +
                'void main() {\n' +
                        'gl_Position = u_MvpMatrix * a_Position;\n' +
                        'gl_PointSize = a_PointSize;\n' +                    // Set the point size
                        // Recalculate normal with normal matrix and make its length 1.0
                        ' vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +

                        // 点光源
                        // Calculate the world coordinate of the vertex
                        ' vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
                        // Calculate the light direction and make it 1.0 in length
                        ' vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
                        ' float nDotL = max(dot(lightDirection, normal), 0.0);\n' +

                        // 平行光
                        // Dot product of light direction and orientation of a surface
                        // ' float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +

                        // Calculate the color due to diffuse reflection
                        ' vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;\n' +
                        // Calculate the color due to ambient reflection
                        ' vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
                        // Add surface colors due to diffuse and ambient reflection
                        ' v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
                    '}\n',

                // Fragment shader program
                FSHADER_SOURCE:
                    'precision mediump float;\n' +
                    'varying vec4 v_Color;\n' +
                    'void main() {\n' +
                    '  gl_FragColor = v_Color;\n' + // Receive the data from the vertex shader
                    '}\n',
                g_mvpMatrix: new Matrix4(),
                g_normalMatrix: new Matrix4(),
                g_modelMatrix: new Matrix4(),
                viewProjMatrix: new Matrix4(),
                armPro: {},
                ANGLE_STEP: 3.0,    // The increments of rotation angle (degrees)
                g_arm1Angle: -90.0, // The rotation angle of arm1 (degrees)
                g_joint1Angle: 0.0, // The rotation angle of joint1 (degrees)
                g_joint2Angle: 0.0, // The rotation angle of joint2 (degrees)
                g_joint3Angle: 0.0, // The rotation angle of joint3 (degrees)
                g_matrixStack: [],
                angle: {
                    x: 0,
                    y: 0
                },
                dragging: false,
                mousedown: {
                    x: null,
                    y: null
                }
            }
        },
        methods: {
            onMousedown({ clientX: x, clientY: y, target }) {
                let { left, right, top, bottom } = target.getBoundingClientRect();
                let { mousedown } = this;
                // Start dragging if a mouse is in <canvas>
                if (left <= x && x < right && top <= y && y < bottom) {
                    this.dragging = true;
                    mousedown.x = x;
                    mousedown.y = y;
                }
            },
            onMousemove({ clientX: x, clientY: y }) {
                  let { mousedown, dragging, canvas, angle } = this;
                  if (dragging) {
                      // The rotation ratio
                      let factor = 100 / canvas.height;
                      let dx = factor * (x - mousedown.x);
                      let dy = factor * (y - mousedown.y);
                      angle.x += dx;
                      angle.y += dy;
                      mousedown.x = x;
                      mousedown.y = y;
                  }
            },
            onMouseup() {
                this.dragging = false;
            },
            onKeydown({ which }) {
                let { g_joint1Angle, ANGLE_STEP, g_arm1Angle, g_joint2Angle, g_joint3Angle } = this;
                switch (which) {
                    case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
                        if (g_joint1Angle < 135.0) this.g_joint1Angle += ANGLE_STEP;
                        break;
                    case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
                        if (g_joint1Angle > -135.0) this.g_joint1Angle -= ANGLE_STEP;
                        break;
                    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
                        this.g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
                        break;
                    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
                        this.g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
                        break;
                    case 90: // Z key -> the positive rotation of joint2
                        this.g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
                        break;
                    case 88: // X key -> the negative rotation of joint2
                        this.g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
                        break;
                    case 86: // V key -> the positive rotation of joint3
                        if (g_joint3Angle < 60.0) this.g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
                        break;
                    case 67: // C key -> the negative rotation of joint3
                        if (g_joint3Angle > -60.0) this.g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
                        break;
                    default: return; // Skip drawing at no effective action
                }
                // Draw the robot arm
                this.draw();
            },
            drawArms() {
                 let {
                    gl,
                    program, canvas, viewProjMatrix } = this;
                let u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
                let u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
                let u_LightDirection = gl.getUniformLocation(program, 'u_LightDirection');
                let u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
                let u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');
                let u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
                let u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
                this.armPro = {
                    u_MvpMatrix,
                    u_LightColor,
                    u_LightDirection,
                    u_AmbientLight,
                    u_NormalMatrix,
                    u_ModelMatrix,
                    u_LightPosition
                };
                const FSIZE = Float32Array.BYTES_PER_ELEMENT;
                // Create a cube
                //    v6----- v5
                //   /|      /|
                //  v1------v0|
                //  | |     | |
                //  | |v7---|-|v4
                //  |/      |/
                //  v2------v3

                let vertices = [   // Vertex coordinates
                    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
                    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
                    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
                    -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
                    -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
                    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
                ];

                let colors = [     // Colors
                    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
                    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
                    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
                    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
                ];

                let normals = new Float32Array([    // Normal
                    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
                    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
                    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
                    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
                    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
                    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
                ]);

                let verCol = vertices.reduce((acc, cur, index, arr) => {
                    if (index === 0 || index % 3 === 0) {
                        acc.push(
                            cur, arr[index + 1], arr[index + 2],
                            // colors[index], colors[index + 1], colors[index + 2],
                            1,0.4,0,
                            normals[index], normals[index + 1], normals[index + 2]
                        );
                    }
                    return acc;
                }, []);

                let verticesColors = new Float32Array(verCol);

                let indices = new Uint8Array([       // Indices of the vertices
                    0, 1, 2,   0, 2, 3,    // front
                    4, 5, 6,   4, 6, 7,    // right
                    8, 9,10,   8,10,11,    // up
                    12,13,14,  12,14,15,    // left
                    16,17,18,  16,18,19,    // down
                    20,21,22,  20,22,23     // back
                ]);
                let { lookAt: { eye, look, up } } = this;
                initVertexBuffers({
                    gl,
                    program,
                    vertices: verticesColors,
                    indices,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            size: 3,
                            stride: FSIZE * 9,
                            offset: 0
                        },
                        {
                            attrVar: 'a_Color',
                            size: 3,
                            stride: FSIZE * 9,
                            offset: FSIZE * 3
                        },
                        {
                            attrVar: 'a_Normal',
                            size: 3,
                            stride: FSIZE * 9,
                            offset: FSIZE * 6
                        }
                    ],
                });
                // Set the light color (white)
                gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
                // Set the position of the light source (in the world coordinate)
                gl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
                // Set the light direction (in the world coordinate)
                let lightDirection = new Vector3([0.5, 3.0, 4.0]);
                lightDirection.normalize(); // Normalize
                gl.uniform3fv(u_LightDirection, lightDirection.elements);
                gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
                // viewMatrix.setOrtho(left, right, bottom, top, near, far);

                viewProjMatrix.setPerspective(50, canvas.width/canvas.height, 1, 1000);
                viewProjMatrix.lookAt(
                    eye.x, eye.y, eye.z,
                    look.x, look.y, look.z,
                    up.x, up.y, up.z
                );

                this.draw();
            },
            draw() {
                let { gl,
                    g_arm1Angle,
                    g_joint1Angle,
                    g_joint2Angle,
                    g_matrixStack,
                    g_joint3Angle,
                    angle
                } = this;
                // Clear color and depth buffer
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Draw a base
                let baseHeight = 2.0;
                this.g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
                this.g_modelMatrix.rotate(angle.y, 1, 0, 0);
                this.g_modelMatrix.rotate(angle.x, 0, 1, 0);
                this.drawBox({ width: 10.0, height: baseHeight, depth: 10.0 });


                // Arm1
                let arm1Length = 10.0; // Length of arm1
                // Move onto the base
                this.g_modelMatrix.translate(0.0, baseHeight, 0.0);
                this.g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);    // Rotate around the y-axis
                this.drawBox({ width: 3.0, height: arm1Length, depth: 3.0 }); // Draw

                // Arm2
                let arm2Length = 10.0;
                this.g_modelMatrix.translate(0.0, arm1Length, 0.0);      // Move to joint1
                this.g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // Rotate around the z-axis
                this.drawBox({ width: 4.0, height: arm2Length, depth: 4.0 }); // Draw

                //  A palm
                let palmLength = 2.0;
                // Move to palm
                this.g_modelMatrix.translate(0.0, arm2Length, 0.0);
                // Rotate around the y-axis
                this.g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
                this.drawBox({ width: 2.0, height: palmLength, depth: 6.0 });

                // Move to the center of the tip of the palm
                this.g_modelMatrix.translate(0.0, palmLength, 0.0);
                // Draw finger1
                g_matrixStack.push(new Matrix4(this.g_modelMatrix));
                this.g_modelMatrix.translate(0.0, 0.0, 2.0);
                this.g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
                this.drawBox({ width: 1.0, height: 2.0, depth: 1.0 });
                this.g_modelMatrix = g_matrixStack.pop();

                // Draw finger2
                this.g_modelMatrix.translate(0.0, 0.0, -2.0);
                this.g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
                this.drawBox({ width: 1.0, height: 2.0, depth: 1.0 });
                requestAnimationFrame(this.draw);
            },
            drawBox({ width, height, depth }) {
                let { gl, g_mvpMatrix, g_normalMatrix, g_modelMatrix, viewProjMatrix, g_matrixStack } = this;
                let { armPro: { u_MvpMatrix, u_NormalMatrix, u_ModelMatrix } } = this;
                // Save the model matrix
                g_matrixStack.push(new Matrix4(g_modelMatrix));
                // Scale a cube and draw
                g_modelMatrix.scale(width, height, depth);
                // Pass the model matrix to u_ModelMatrix
                gl.uniformMatrix4fv(u_ModelMatrix, false, g_modelMatrix.elements);
                // Calculate the model view project matrix and pass it to u_MvpMatrix
                g_mvpMatrix.set(viewProjMatrix).multiply(g_modelMatrix);
                gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
                // Calculate the normal transformation matrix and pass it to u_NormalMatrix
                g_normalMatrix.setInverseOf(g_modelMatrix);
                g_normalMatrix.transpose();
                gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
                // Draw
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
                // Retrieve the model matrix
                this.g_modelMatrix = g_matrixStack.pop();
            },
            init() {
                let { VSHADER_SOURCE, FSHADER_SOURCE } = this;
                // Retrieve <canvas> element
                this.canvas = document.getElementById('webgl');
                this.canvas.focus();
                // Get the rendering context for WebGL
                this.gl = this.canvas.getContext('webgl');
                let { gl } = this;
                this.program = createProgram({ gl, vSource: VSHADER_SOURCE, fSource: FSHADER_SOURCE });
                let a_PointSize = gl.getAttribLocation(this.program, 'a_PointSize');
                let u_FragColor = gl.getUniformLocation(this.program, 'u_FragColor');
                gl.vertexAttrib1f(a_PointSize, 10.0);
                gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                // gl.clear(gl.COLOR_BUFFER_BIT);
            },
            addPoint(e) {
                let { canvas, g_points, gl, program } = this;
                let { clientX: x, clientY: y } = e;
                let loc = windowToCanvas({ x, y, canvas });
                let a_Position = gl.getAttribLocation(program, 'a_Position');
                loc.color = [Math.random(), Math.random(), Math.random(), 1.0],
                g_points.push(loc);
                gl.clear(gl.COLOR_BUFFER_BIT);
                g_points.forEach(point => {
                    let { x, y, color } = point;
                    let u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
                    gl.vertexAttrib3f(a_Position, x, y, 0.0);
                    gl.uniform4fv(u_FragColor, color)
                    gl.drawArrays(gl.POINTS, 0, 1);
                });
            },
        },
        mounted() {
            this.init();
            this.drawArms();
        }
    }
</script>
