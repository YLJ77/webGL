<template>
    <div>
        <canvas @mousedown="drawPoint" ref="canvas" id="example" width="400" height="400">Please use a browser that supports "canvas"</canvas>
    </div>
</template>

<script>
    import { initShader, windowToWebGL } from "@/util/appFunc";
    import pointVS from '@/views/point/shaders/point.vert'
    import pointFS from '@/views/point/shaders/point.frag'

    export default {
        data() {
            return {
                points: [],
                gl: null
            }
        },
        methods: {
            drawPoint({ clientX, clientY }) {
                const { points, gl, $refs: { canvas } } = this;
                const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
                const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
                const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
                const point = windowToWebGL({ x: clientX, y: clientY, canvas });
                point.color = new Float32Array([Math.random(), Math.random(), Math.random(), 1.0]);
                gl.vertexAttrib1f(a_PointSize, 10);
                points.push(point);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                points.forEach(({ x, y, color }) => {
                    gl.vertexAttrib2f(a_Position, x, y);
                    gl.uniform4fv(u_FragColor, color);
                    gl.drawArrays(gl.POINTS, 0, 1);
                });
            },
            main() {
                const gl = this.$refs.canvas.getContext('webgl');
                initShader({ gl, vSource: pointVS, fSource: pointFS });
                this.gl = gl;
                // Specify the color for clearing <canvas>
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                // Clear <canvas>
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        },
        mounted() {
            this.main();
        }
    }
</script>