<template>
    <canvas id="webgl" width="400" height="400" tabindex="1">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { Vector3, createProgram, windowToCanvas, initVertexBuffers, initTextures } from "../util/appFunc";
    import { Matrix4 } from "../util/Matrix4";

    export default {
        data() {
            return {
                lookAt: {
                    eye: {
                        x: 0,
                        y: 0,
                        z: 5
                    },
                    look: {
                        x: 0,
                        y: 0,
                        z: -100
                    },
                    up: {
                        x: 0,
                        y: 1,
                        z: 0
                    }
                },
                ortho: {
                    left: -1,
                    right: 1,
                    bottom: -1,
                    top: 1,
                    near: 0,
                    far: 2.0
                },
                canvas: null,
                ctx: null,
                program: null,
                shape: null,
                VSHADER_SOURCE:
                    'attribute vec4 a_Normal;\n' +
                    'attribute vec4 a_Position;\n' +
                    'uniform mat4 u_MvpMatrix;\n' +
                    'uniform mat4 u_NormalMatrix;\n' +
                    'varying vec4 v_Color;\n' +
                    'void main() {\n' +
                    '  gl_Position = u_MvpMatrix * a_Position;\n' +
                    // Shading calculation to make the arm look three-dimensional
                    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
                    '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +
                    '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
                    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
                    '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
                    '}\n',

                // Fragment shader program
                FSHADER_SOURCE:
                    'precision mediump float;\n' +
                    'varying vec4 v_Color;\n' +
                    'void main() {\n' +
                    '  gl_FragColor = v_Color;\n' +
                    '}\n',
                ANGLE_STEP: 3.0,    // The increments of rotation angle (degrees)
                g_arm1Angle: -90.0, // The rotation angle of arm1 (degrees)
                g_joint1Angle: 0.0, // The rotation angle of joint1 (degrees)
                viewProjMatrix: new Matrix4(),
                // Coordinate transformation matrix
                g_modelMatrix: new Matrix4(),
                g_mvpMatrix: new Matrix4(),
                g_normalMatrix: new Matrix4() // Coordinate transformation matrix for normals
            }
        },
        methods: {
            drawArms() {
                let { ctx, program, viewProjMatrix, canvas } = this;
                // Vertex coordinates（a cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
                let positions = [
                    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
                    1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
                    1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
                    -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
                    -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
                    1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
                ];

                // Normal
                let normals = [
                    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
                    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
                    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
                    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
                    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
                    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
                ];

                // Indices of the vertices
                let indices = new Uint8Array([
                    0, 1, 2,   0, 2, 3,    // front
                    4, 5, 6,   4, 6, 7,    // right
                    8, 9,10,   8,10,11,    // up
                    12,13,14,  12,14,15,    // left
                    16,17,18,  16,18,19,    // down
                    20,21,22,  20,22,23     // back
                ]);
                let vertices = this.concatVertices(positions, normals);
                const FSIZE = Float32Array.BYTES_PER_ELEMENT;
                // Calculate the view projection matrix
                viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
                viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
                initVertexBuffers({
                    ctx,
                    program,
                    vertices: vertices,
                    indices,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            size: 3,
                            stride: FSIZE * 6,
                            offset: 0
                        },
                        {
                            attrVar: 'a_Normal',
                            size: 3,
                            stride: FSIZE * 6,
                            offset: FSIZE * 3
                        }
                    ],
                });
                // this.draw();
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
                ctx.drawElements(ctx.TRIANGLES, 24, ctx.UNSIGNED_BYTE, 0);
            },
            onKeyDown(e) {
                let { which } = e;
                let { ANGLE_STEP, g_arm1Angle, g_joint1Angle } = this;
                switch (which) {
                    case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
                        if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
                        break;
                    case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
                        if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
                        break;
                    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
                        g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
                        break;
                    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
                        g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
                        break;
                    default: return; // Skip drawing at no effective action
                }
                // Draw the robot arm
                this.draw();
            },
            draw() {
                let { ctx, g_modelMatrix, g_arm1Angle, g_joint1Angle } = this;
                // Clear color and depth buffer
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

                // Arm1
                let arm1Length = 10.0; // Length of arm1
                g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
                g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);    // Rotate around the y-axis
                this.drawBox(); // Draw

                // Arm2
                g_modelMatrix.translate(0.0, arm1Length, 0.0); 　　　// Move to joint1
                g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // Rotate around the z-axis
                g_modelMatrix.scale(1.3, 1.0, 1.3); // Make it a little thicker
                this.drawBox(); // Draw
            },
            drawBox() {
                let { ctx, g_mvpMatrix, g_modelMatrix, g_normalMatrix, viewProjMatrix, program } = this;
                let u_MvpMatrix = ctx.getUniformLocation(program, 'u_MvpMatrix');
                let u_NormalMatrix = ctx.getUniformLocation(program, 'u_NormalMatrix');
                // Calculate the model view project matrix and pass it to u_MvpMatrix
                g_mvpMatrix.set(viewProjMatrix);
                g_mvpMatrix.multiply(g_modelMatrix);
                ctx.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
                // Calculate the normal transformation matrix and pass it to u_NormalMatrix
                g_normalMatrix.setInverseOf(g_modelMatrix);
                g_normalMatrix.transpose();
                ctx.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
                // Draw
                ctx.drawElements(ctx.TRIANGLES, 24, ctx.UNSIGNED_BYTE, 0);
            },
            concatVertices(vertices, ...others) {
                let arr = vertices.reduce((acc, cur, index, arr) => {
                    if (index === 0 || index % 3 === 0) {
                        acc.push(
                            cur, arr[index + 1], arr[index + 2],
                        );
                        others.forEach(other => {
                            acc.push(other[index], other[index + 1], other[index + 2]);
                        })
                    }
                    return acc;
                }, []);
                return new Float32Array(arr);
            },
            setEyePoint(e) {
                let { lookAt: { eye }, ortho, shape } = this;
                let { which } = e;
                let codeMapAction = {
                    39: {               // right
                        action: 'add',
                        field: 'x',
                        variable: eye
                    },
                    38: {               // up
                        action: 'add',
                        field: 'y',
                        variable: eye
                    },
                    33: {               // PU
                        action: 'add',
                        field: 'z',
                        variable: eye
                    },
                    37: {               // left
                        action: 'reduce',
                        field: 'x',
                        variable: eye
                    },
                    40: {               // down
                        action: 'reduce',
                        field: 'y',
                        variable: eye
                    },
                    34: {               // PD
                        action: 'reduce',
                        field: 'z',
                        variable: eye
                    },
                    87: {               // W
                        action: 'add',
                        field: 'far',
                        variable: ortho
                    },
                    83: {               // S
                        action: 'reduce',
                        field: 'far',
                        variable: ortho
                    },
                    65: {               // A
                        action: 'reduce',
                        field: 'near',
                        variable: ortho
                    },
                    68: {               // D
                        action: 'add',
                        field: 'near',
                        variable: ortho
                    },
                };
                if (!codeMapAction[which]) return;
                let step = 0.1;
                let { action, field, variable } = codeMapAction[which];
                if (action === 'add') {
                    /*if (variable[field] < 1) */variable[field] += step;
                } else if (action === 'reduce') {
                    /*if (variable[field] > 0.01) */variable[field] -= step;
                }
                this[`draw${ shape }`]();
            },
            drawCube() {
                 let {
                    ctx,
                    program, canvas } = this;
                let u_MvpMatrix = ctx.getUniformLocation(program, 'u_MvpMatrix');
                let u_LightColor = ctx.getUniformLocation(program, 'u_LightColor');
                let u_LightDirection = ctx.getUniformLocation(program, 'u_LightDirection');
                let u_AmbientLight = ctx.getUniformLocation(program, 'u_AmbientLight');
                let u_NormalMatrix = ctx.getUniformLocation(program, 'u_NormalMatrix');
                let u_ModelMatrix = ctx.getUniformLocation(program, 'u_ModelMatrix');
                let u_LightPosition = ctx.getUniformLocation(program, 'u_LightPosition');
                let viewMatrix = new Matrix4();
                let modelMatrix = new Matrix4(); // Model matrix
                let projMatrix = new Matrix4(); // Projection matrix
                let mvpMatrix = new Matrix4();
                let normalMatrix = new Matrix4(); // Transformation matrix for normal
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
                    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
                    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
                    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
                    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
                    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
                    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
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
                            1,1,1,
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
                if (!this.drawCube.firstCall) {
                    this.lookAt = {
                        eye: {
                            x: 3,
                            y: 3,
                            z: 7
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
                    };
                    this.shape = 'Cube';
                    this.drawCube.firstCall = true;
                }
                let { lookAt: { eye, look, up } } = this;
                initVertexBuffers({
                    ctx,
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
                ctx.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
                // Set the position of the light source (in the world coordinate)
                ctx.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
                // Set the light direction (in the world coordinate)
                let lightDirection = new Vector3([0.5, 3.0, 4.0]);
                lightDirection.normalize(); // Normalize
                ctx.uniform3fv(u_LightDirection, lightDirection.elements);
                ctx.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
                // viewMatrix.setOrtho(left, right, bottom, top, near, far);
                modelMatrix.setTranslate({ x: 0, y: 1, z: 0 });
                modelMatrix.rotate({ angle: 90, x:0, y:0, z:1 });
                // Pass the model matrix to u_ModelMatrix
                ctx.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
                viewMatrix.setLookAt(
                    eye.x, eye.y, eye.z,
                    look.x, look.y, look.z,
                    up.x, up.y, up.z
                );
                projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
                mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
                ctx.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
                // Calculate matrix to transform normal based on the model matrix
                normalMatrix.setInverseOf(modelMatrix);
                normalMatrix.transpose();
                // Pass the transformation matrix for normal to u_NormalMatrix
                ctx.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
                ctx.drawElements(ctx.TRIANGLES, indices.length, ctx.UNSIGNED_BYTE, 0);
            },
            init() {
                let { VSHADER_SOURCE, FSHADER_SOURCE } = this;
                // Retrieve <canvas> element
                this.canvas = document.getElementById('webgl');
                this.canvas.focus();
                // Get the rendering context for WebGL
                this.ctx = this.canvas.getContext('webgl');
                let { ctx } = this;
                this.program = createProgram({ ctx, vSource: VSHADER_SOURCE, fSource: FSHADER_SOURCE });
                ctx.clearColor(0.0, 0.0, 0.0, 1.0);
                ctx.enable(ctx.DEPTH_TEST);
                document.onkeydown = this.onKeyDown;
            },
            addPoint(e) {
                let { canvas, g_points, ctx, program } = this;
                let { clientX: x, clientY: y } = e;
                let loc = windowToCanvas({ x, y, canvas });
                let a_Position = ctx.getAttribLocation(program, 'a_Position');
                loc.color = [Math.random(), Math.random(), Math.random(), 1.0],
                g_points.push(loc);
                ctx.clear(ctx.COLOR_BUFFER_BIT);
                g_points.forEach(point => {
                    let { x, y, color } = point;
                    let u_FragColor = ctx.getUniformLocation(program, 'u_FragColor');
                    ctx.vertexAttrib3f(a_Position, x, y, 0.0);
                    ctx.uniform4fv(u_FragColor, color)
                    ctx.drawArrays(ctx.POINTS, 0, 1);
                });
            },
        },
        mounted() {
            this.init();
            // this.drawCube();
            this.drawArms();
        }
    }
</script>
