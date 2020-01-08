<template>
    <div>
        <canvas-wrap @onProgramLoaded="drawThreePoints" ref="canvasWrap" @click="drawPoint" :v-source="pointVS" :f-source="pointFS"></canvas-wrap>
    </div>
</template>

<script>
    import { windowToWebGL, initVertexBuffers } from "@/util/appFunc";
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
            drawThreePoints(gl) {
                const vertices = new Float32Array([
                    0.0, 0.5,/*coordinate*/ 1.0, 0.0, 0.0,/*color*/ 10.0,/*size*/
                    -0.5, -0.5, 0.0, 1.0, 0.0, 20.0,
                    0.5, -0.5, 0.0, 0.0, 1.0, 30.0
                ]);
                const FSIZE = vertices.BYTES_PER_ELEMENT;
                initVertexBuffers({
                    gl,
                    program: gl.program,
                    vertices,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            size: 2,
                            stride: FSIZE * 6,
                            offset: 0
                        },
                        {
                            attrVar: 'a_PointSize',
                            size: 1,
                            stride: FSIZE * 6,
                            offset: FSIZE * 5
                        },
                        {
                            attrVar: 'a_Color',
                            size: 3,
                            stride: FSIZE * 6,
                            offset: FSIZE * 2
                        }
                    ]
                });
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.POINTS, 0, 3);
            },
            drawPoint({ clientX, clientY }) {
                const { points, $refs: { canvasWrap: { $refs: { canvas }, gl } } } = this;
                const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
                const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
                const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
                const point = windowToWebGL({ x: clientX, y: clientY, canvas });
                gl.disableVertexAttribArray('a_Position');
                point.color = new Float32Array([Math.random(), Math.random(), Math.random(), 1.0]);
                gl.vertexAttrib1f(a_PointSize, 10);
                points.push(point);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                points.forEach(({ x, y, color }) => {
                    gl.vertexAttrib2f(a_Position, x, y);
                    gl.vertexAttrib4fv(a_Color, color);
                    gl.drawArrays(gl.POINTS, 0, 1);
                });
            },
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        }
    }
</script>