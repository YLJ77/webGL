<template>
    <canvas id="webgl" width="400" height="400" @click="addPoint">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { createProgram, windowToCanvas, initVertexBuffers } from "../util/appFunc";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null,
                g_points: [],
                program: null,
                VSHADER_SOURCE:
                    'attribute vec4 a_Position;\n' +
                    'attribute float a_PointSize;\n' +
                    'void main() {\n' +
                    '  gl_Position = a_Position;\n' + // Set the vertex coordinates of the point
                    '  gl_PointSize = a_PointSize;\n' +                    // Set the point size
                    '}\n',

                // Fragment shader program
                FSHADER_SOURCE:
                    'precision mediump float;\n' +
                    'uniform vec4 u_FragColor;\n' +
                    'void main() {\n' +
                    '  gl_FragColor = u_FragColor;\n' + // Set the point color
                    '}\n'
            }
        },
        methods: {
            drawTriangle() {
                let { ctx, program } = this;
                let vertices = new Float32Array([ 0.0, 0.5,   -0.5, -0.5,   0.5, -0.5 ]);
                // Write the positions of vertices to a vertex shader
                let n = initVertexBuffers({ ctx, program, vertices, attrVar: 'a_Position' });

                // Specify the color for clearing <canvas>
                ctx.clearColor(0, 0, 0, 1);

                // Clear <canvas>
                ctx.clear(ctx.COLOR_BUFFER_BIT);

                // Draw three points
                ctx.drawArrays(ctx.LINE_LOOP, 0, n);
                ctx.disableVertexAttribArray(ctx.getAttribLocation(program, 'a_Position'));
            },
            init() {
                let { VSHADER_SOURCE, FSHADER_SOURCE } = this;
                // Retrieve <canvas> element
                this.canvas = document.getElementById('webgl');
                // Get the rendering context for WebGL
                this.ctx = this.canvas.getContext('webgl');
                let { ctx } = this;
                this.program = createProgram({ ctx, vSource: VSHADER_SOURCE, fSource: FSHADER_SOURCE });
/*                let a_PointSize = ctx.getAttribLocation(this.program, 'a_PointSize');
                ctx.vertexAttrib1f(a_PointSize, 10.0);*/
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
            this.drawTriangle();
        }
    }
</script>
