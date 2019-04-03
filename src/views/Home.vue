<template>
    <canvas id="webgl" width="400" height="400" @click="addPoint">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { createProgram, windowToCanvas, initVertexBuffers, initTextures } from "../util/appFunc";
    import { Matrix4 } from "../util/Matrix4";
    import sky from '../assets/sky.jpg'
    import circle from '../assets/circle.gif'

    export default {
        data() {
            return {
                g_last: null,
                canvas: null,
                ctx: null,
                g_points: [],
                program: null,
                VSHADER_SOURCE:
                    'uniform mat4 u_ModelMatrix;\n' +
                    'attribute vec4 a_Position;\n' +
                    'attribute float a_PointSize;\n' +
                    'attribute vec4 a_Color;\n' +
                    'varying vec4 v_Color;\n' + // varying variable
                    'attribute vec2 a_TexCoord;\n' +
                    'varying vec2 v_TexCoord;\n' +
                    'void main() {\n' +
                        'gl_Position = u_ModelMatrix * a_Position;\n' +
                        'gl_PointSize = a_PointSize;\n' +                    // Set the point size
                        'v_Color = a_Color;\n' +        // Pass the data to the fragment shader
                        'v_TexCoord = a_TexCoord;\n' +
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
                    // '  gl_FragColor = v_Color;\n' + // Receive the data from the vertex shader
                    // ' gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);\n' +
                    //     'gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
                    ' vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
                    ' vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
                    ' gl_FragColor = color0 * color1;\n' +
                    '}\n'
            }
        },
        methods: {
            drawPoints() {
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
                let u_ModelMatrix = ctx.getUniformLocation(program, 'u_ModelMatrix');
                this.g_last = Date.now();
                let animateRotate = () => {
                    this.draw(n, currentAngle += 1, modelMatrix, u_ModelMatrix);
                    requestAnimationFrame(animateRotate);// Request that the browser calls animateRotate
                };
                animateRotate();
/*                ctx.clear(ctx.COLOR_BUFFER_BIT);
                ctx.drawArrays(ctx.TRIANGLES, 0, n);*/

                // ctx.disableVertexAttribArray(ctx.getAttribLocation(program, 'a_Position'));
            },
            draw(n, currentAngle, modelMatrix, u_ModelMatrix) {
                let { ctx } = this;
                // Set up rotation matrix
                modelMatrix.setRotate({ angle: currentAngle, x: 0, y: 0, z: 1 });
                modelMatrix.translate({ x: 0.35, y: 0, z: 0 });

                // Pass the rotation matrix to the vertex shader
                ctx.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

                // Clear <canvas>
                ctx.clear(ctx.COLOR_BUFFER_BIT);

                // Draw a triangle
                ctx.drawArrays(ctx.TRIANGLES, 0, n);
            },
            init() {
                let { VSHADER_SOURCE, FSHADER_SOURCE } = this;
                // Retrieve <canvas> element
                this.canvas = document.getElementById('webgl');
                // Get the rendering context for WebGL
                this.ctx = this.canvas.getContext('webgl');
                let { ctx } = this;
                this.program = createProgram({ ctx, vSource: VSHADER_SOURCE, fSource: FSHADER_SOURCE });
                let a_PointSize = ctx.getAttribLocation(this.program, 'a_PointSize');
                let u_FragColor = ctx.getUniformLocation(this.program, 'u_FragColor');
                let u_ModelMatrix = ctx.getUniformLocation(this.program, 'u_ModelMatrix');
                ctx.uniformMatrix4fv(u_ModelMatrix, false, new Float32Array([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                ]));
                ctx.vertexAttrib1f(a_PointSize, 10.0);
                ctx.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
                ctx.clearColor(0.0, 0.0, 0.0, 1.0);
                ctx.clear(ctx.COLOR_BUFFER_BIT);
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
            this.drawPoints();
        }
    }
</script>
