<template>
    <div>
        <canvas-wrap ref="canvasWrap" @click="drawPoint" :v-source="pointVS" :f-source="pointFS"></canvas-wrap>
    </div>
</template>

<script>
    import { windowToWebGL } from "@/util/appFunc";
    import pointVS from '@/views/point/shaders/point.vert'
    import pointFS from '@/views/point/shaders/point.frag'

    export default {
        data() {
            return {
                pointVS,
                pointFS,
                points: [],
            }
        },
        methods: {
            drawPoint({ clientX, clientY }) {
                const { points, $refs: { canvasWrap: { $refs: { canvas }, gl } } } = this;
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
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        }
    }
</script>