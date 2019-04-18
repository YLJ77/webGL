<template>
    <canvas id="webgl" width="400" height="400" @click="addPoint" @keydown="setEyePoint" tabindex="1">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { Vector3, createProgram, windowToCanvas, initVertexBuffers, initTextures } from "../util/appFunc";
    import { Matrix4 } from "../util/Matrix4";
    import sky from '../assets/sky.jpg'
    import circle from '../assets/circle.gif'

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
                g_points: [],
                program: null,
                shape: null,
                VSHADER_SOURCE:
                    'uniform mat4 u_MvpMatrix;\n' +
                    'attribute vec4 a_Normal;\n' + // Normal
                    'uniform vec3 u_LightColor;\n' + // Light color
                    'uniform vec3 u_LightDirection;\n' + // world coordinate, normalized
                    'attribute vec4 a_Position;\n' +
                    'attribute float a_PointSize;\n' +
                    'attribute vec4 a_Color;\n' +
                    'varying vec4 v_Color;\n' + // varying variable
                    'attribute vec2 a_TexCoord;\n' +
                    'varying vec2 v_TexCoord;\n' +
                    'void main() {\n' +
                        'gl_Position = u_MvpMatrix * a_Position;\n' +
                        'gl_PointSize = a_PointSize;\n' +                    // Set the point size
                        // Make the length of the normal 1.0
                        ' vec3 normal = normalize(vec3(a_Normal));\n' +
                        // Dot product of light direction and orientation of a surface
                        ' float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
                        // Calculate the color due to diffuse reflection
                        ' vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;\n' +
                        ' v_Color = vec4(diffuse, a_Color.a);\n' +
                    '}\n',

                // Fragment shader program
                FSHADER_SOURCE:
                    'precision mediump float;\n' +
                    // 'uniform vec4 u_FragColor;\n' +
                    'uniform float u_Width;\n' +
                    'uniform float u_Height;\n' +
                    'varying vec4 v_Color;\n' +
                    'uniform sampler2D u_Sampler0;\n' +
                    'uniform sampler2D u_Sampler1;\n' +
                    'varying vec2 v_TexCoord;\n' +
                    'void main() {\n' +
                    // '  gl_FragColor = u_FragColor;\n' + // Set the point color
                    '  gl_FragColor = v_Color;\n' + // Receive the data from the vertex shader
                    // ' gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);\n' +
                    //     'gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
                    /*                    ' vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
                                        ' vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
                                        ' gl_FragColor = color0 * color1;\n' +*/
                    '}\n'
            }
        },
        methods: {
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
                let viewMatrix = new Matrix4();
                let modelMatrix = new Matrix4(); // Model matrix
                let projMatrix = new Matrix4(); // Projection matrix
                let mvpMatrix = new Matrix4();
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
                            colors[index], colors[index + 1], colors[index + 2],
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
                // Set the light direction (in the world coordinate)
                let lightDirection = new Vector3([0.5, 3.0, 4.0]);
                lightDirection.normalize(); // Normalize
                ctx.uniform3fv(u_LightDirection, lightDirection.elements);
                // viewMatrix.setOrtho(left, right, bottom, top, near, far);
                modelMatrix.setTranslate({ x: 0.75, y: 0, z: 0 }); // Translate 0.75 units
                viewMatrix.setLookAt(
                    eye.x, eye.y, eye.z,
                    look.x, look.y, look.z,
                    up.x, up.y, up.z
                );
                projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
                mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
                ctx.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
                ctx.drawElements(ctx.TRIANGLES, indices.length, ctx.UNSIGNED_BYTE, 0);
            },
            draw3DTriangle() {
                let {
                    ctx,
                    program, canvas, ortho: { left, right, bottom, top, near, far } } = this;
                let u_MvpMatrix = ctx.getUniformLocation(this.program, 'u_MvpMatrix');
                let viewMatrix = new Matrix4();
                let modelMatrix = new Matrix4(); // Model matrix
                let projMatrix = new Matrix4(); // Projection matrix
                let mvpMatrix = new Matrix4();
                const FSIZE = Float32Array.BYTES_PER_ELEMENT;
                let verticesColors = new Float32Array([
                    // Vertex coordinates and color
                    0.0, 1.0, -4.0, 0.4, 1.0, 0.4, // The back green triangle
                    -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
                    0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

                    0.0, 1.0, -2.0, 1.0, 1.0, 0.4, // The middle yellow triangle
                    -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
                    0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

                    0.0, 1.0, 0.0, 0.4, 0.4, 1.0, // The front blue triangle
                    -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
                    0.5, -1.0, 0.0, 1.0, 0.4, 0.4
                ]);
                if (!this.draw3DTriangle.firstCall) {
                    this.lookAt = {
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
                    };
                    this.shape = '3DTriangle';
                    this.draw3DTriangle.firstCall = true;
                }
                let { lookAt: { eye, look, up } } = this;
                initVertexBuffers({
                    ctx,
                    program,
                    vertices: verticesColors,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            size: 3,
                            stride: FSIZE * 6,
                            offset: 0
                        },
                        {
                            attrVar: 'a_Color',
                            size: 3,
                            stride: FSIZE * 6,
                            offset: FSIZE * 3
                        }
                    ],
                });
                // viewMatrix.setOrtho(left, right, bottom, top, near, far);
                modelMatrix.setTranslate({ x: 0.75, y: 0, z: 0 }); // Translate 0.75 units
                viewMatrix.setLookAt(
                    eye.x, eye.y, eye.z,
                    look.x, look.y, look.z,
                    up.x, up.y, up.z
                );
                projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
                mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
                ctx.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
                ctx.clear(ctx.COLOR_BUFFER_BIT);
                ctx.drawArrays(ctx.TRIANGLES, 0, 9); // Draw the rectangle
                modelMatrix.setTranslate({ x: -0.75, y: 0, z: 0 }); // Translate 0.75 units
                mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
                ctx.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
                ctx.drawArrays(ctx.TRIANGLES, 0, 9); // Draw the rectangle
            },
            drawTexture() {
                let { ctx, program } = this;
/*                let verticesSizes = new Float32Array([
                    0.0, 0.5, 10.0, 1.0, 0.0, 0.0,
                    -0.5, -0.5, 20.0, 0.0, 1.0, 0.0,
                    0.5, -0.5, 30.0, 0.0, 0.0, 1.0,
                ]);*/
                let verticesTexCoords = new Float32Array([
                    -0.5, 0.5, 0.0, 1.0,
                    -0.5, -0.5, 0.0, 0.0,
                    0.5, 0.5, 1.0, 1.0,
                    0.5, -0.5, 1.0, 0.0
                ]);
                let FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
                initVertexBuffers({
                    ctx,
                    program,
                    // vertices: verticesSizes,
                    vertices: verticesTexCoords,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            size: 2,
                            stride: FSIZE * 4,
                            offset: 0
                        },
                        {
                            attrVar: 'a_TexCoord',
                            size: 2,
                            stride: FSIZE * 4,
                            offset: FSIZE * 2
                        }
/*                        {
                            attrVar: 'a_PointSize',
                            size: 1,
                            stride: FSIZE * 6,
                            offset: FSIZE * 2
                        },*/
/*                        {
                            attrVar: 'a_Color',
                            size: 3,
                            stride: FSIZE * 6,
                            offset: FSIZE * 3
                        }*/
                    ],
                });
                // Get the storage location of uniformVar
                initTextures({ ctx, program, uniformVar: 'u_Sampler0', imgSrc: sky, count: 4, canDraw: false, textUnit: 0 });
                initTextures({ ctx, program, uniformVar: 'u_Sampler1', imgSrc: circle, count: 4, canDraw: true, textUnit: 1 });
                // ctx.disableVertexAttribArray(ctx.getAttribLocation(program, 'a_Position'));
            },
            drawTriangle() {
                let { ctx, program } = this;
                // triangle
                let vertices = new Float32Array([ 0.0, 0.5,   -0.5, -0.5,   0.5, -0.5 ]);
                // Write the positions of vertices to a vertex shader
                let n = initVertexBuffers({ ctx, program, vertices, attrVar: 'a_Position', size: 2 });
                let modelMatrix = new Matrix4();
                let currentAngle = 0.0;
                let u_MvpMatrix = ctx.getUniformLocation(program, 'u_MvpMatrix');
                let animateRotate = () => {
                    this.draw(n, currentAngle += 1, modelMatrix, u_MvpMatrix);
                    requestAnimationFrame(animateRotate);// Request that the browser calls animateRotate
                };
                animateRotate();
/*                ctx.clear(ctx.COLOR_BUFFER_BIT);
                ctx.drawArrays(ctx.TRIANGLES, 0, n);*/

                // ctx.disableVertexAttribArray(ctx.getAttribLocation(program, 'a_Position'));
            },
            draw(n, currentAngle, modelMatrix, u_MvpMatrix) {
                let { ctx } = this;
                // Set up rotation matrix
                modelMatrix.setRotate({ angle: currentAngle, x: 0, y: 0, z: 1 });
                modelMatrix.translate({ x: 0.35, y: 0, z: 0 });

                // Pass the rotation matrix to the vertex shader
                ctx.uniformMatrix4fv(u_MvpMatrix, false, modelMatrix.elements);

                // Clear <canvas>
                ctx.clear(ctx.COLOR_BUFFER_BIT);

                // Draw a triangle
                ctx.drawArrays(ctx.TRIANGLES, 0, n);
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
                let a_PointSize = ctx.getAttribLocation(this.program, 'a_PointSize');
                let u_FragColor = ctx.getUniformLocation(this.program, 'u_FragColor');
                ctx.vertexAttrib1f(a_PointSize, 10.0);
                ctx.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
                ctx.clearColor(0.0, 0.0, 0.0, 1.0);
                ctx.enable(ctx.DEPTH_TEST);
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
                // ctx.clear(ctx.COLOR_BUFFER_BIT);
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
            // this.drawTriangle();
            // this.draw3DTriangle();
            this.drawCube();
        }
    }
</script>
