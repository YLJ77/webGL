<template>
    <canvas id="webgl" width="400" height="400" @click="addPoint">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { createProgram, windowToCanvas, initVertexBuffers } from "../util/appFunc";
    import { Matrix4 } from "../util/Matrix4";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null,
                g_points: [],
                program: null,
                VSHADER_SOURCE:
                    //  x = r cos α
                    //  y = r sin α

                    //  x' = r cos (α + β)
                    //  y' = r sin (α + β )

                    //  x' = r (cos α cos β – sin α sin β)
                    //  y' = r (sin α cos β + cos α sin β)

                    //  x' = x cos β – y sin β
                    //  y' = x sin β + y cos β
                    //  z' = z
                    // 'uniform vec2 u_CosBSinB;\n' +
                    'uniform mat4 u_xformMatrix;\n' +
                    'attribute vec4 a_Position;\n' +
                    'attribute float a_PointSize;\n' +
                    // 'uniform vec4 u_Translation;\n' +
                    'void main() {\n' +
                    'gl_Position = u_xformMatrix * a_Position;\n' +
                    // '  gl_Position = a_Position + u_Translation;\n' + // Set the vertex coordinates of the point
/*                    'gl_Position.x = a_Position.x * u_CosBSinB.x - a_Position.y * u_CosBSinB.y;\n' +
                    'gl_Position.y = a_Position.x * u_CosBSinB.y + a_Position.y * u_CosBSinB.x;\n' +
                    'gl_Position.z = a_Position.z;\n' +
                    'gl_Position.w = 1.0;\n' +*/
                    'gl_PointSize = a_PointSize;\n' +                    // Set the point size
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
                // triangle
                let vertices = new Float32Array([ 0.0, 0.5,   -0.5, -0.5,   0.5, -0.5 ]);
                // rect
                // let vertices = new Float32Array([-0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,-0.5]);

                // Write the positions of vertices to a vertex shader
                let n = initVertexBuffers({ ctx, program, vertices, attrVar: 'a_Position' });

                // translation
/*                let u_Translation = ctx.getUniformLocation(program, 'u_Translation');
                ctx.uniform4f(u_Translation, 0.5, 0.5, 0.0, 0.0);*/

/*                let ANGLE = 0;
                let radian = ANGLE * Math.PI / 180;
                let cosB = Math.cos(radian);
                let sinB = Math.sin(radian);

                // rotate
/!*                let u_CosBSinB = ctx.getUniformLocation(program, 'u_CosBSinB');
                ctx.uniform2f(u_CosBSinB, cosB, sinB);*!/

                // matrix rotate
                let xformMatrix = new Float32Array([
                    0.5 * cosB, sinB, 0.0, 0.0,
                    -sinB, 0.5 * cosB, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    0.5, 0.5, 0.0, 1.0,
                ]);
                let u_xformMatrix = ctx.getUniformLocation(program, 'u_xformMatrix');
                ctx.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);*/

                let xformMatrix = new Matrix4();
                let ANGLE = -45;
                //xformMatrix.setRotate({ angle: ANGLE, x: 0, y: 0, z: 1 })
                // xformMatrix.setTranslate({ x: 0.5, y: 0.5, z: 0 });
                // xformMatrix.scale({ x: 0.5, y: 0.5, z: 1 });
                // xformMatrix.translate({ x: 0.5, y: 0.5, z: 0 });
                xformMatrix.rotate({ angle: ANGLE, x: 0, y: 0, z: 1 });
                let u_xformMatrix = ctx.getUniformLocation(program, 'u_xformMatrix');
                ctx.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

                // Specify the color for clearing <canvas>
                ctx.clearColor(0, 0, 0, 1);

                // Clear <canvas>
                ctx.clear(ctx.COLOR_BUFFER_BIT);

                // Draw three points
                ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, n);
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
                let a_PointSize = ctx.getAttribLocation(this.program, 'a_PointSize');
                ctx.vertexAttrib1f(a_PointSize, 10.0);
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
