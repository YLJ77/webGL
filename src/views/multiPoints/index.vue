<template>
    <div>
        <canvas-wrap ref="canvasWrap" :v-source="pointVS" :f-source="pointFS"></canvas-wrap>
    </div>
</template>

<script>
    import loadShader from '@/mixins/loadShader'
    import { initVertexBuffers } from "@/util/appFunc";
    import pointVS from '@/views/point/shaders/point.vert'
    import pointFS from '@/views/point/shaders/point.frag'

    export default {
        mixins: [loadShader],
        data() {
            return {
                pointVS,
                pointFS,
            }
        },
        methods: {
            main() {
                const { gl } = this.$refs.canvasWrap;
                const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
                gl.vertexAttrib1f(a_PointSize, 10);
                initVertexBuffers({
                   gl,
                   vertices: new Float32Array([0.0, 0.5,   -0.5, -0.5,   0.5, -0.5]),
                    program: gl.program,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            size: 2,
                            stride: 0,
                            offset: 0
                        }
                    ]
                });
                // Specify the color for clearing <canvas>
                gl.clearColor(0, 0, 0, 1);
                // Clear <canvas>
                gl.clear(gl.COLOR_BUFFER_BIT);
                // Draw three points
                gl.drawArrays(gl.POINTS, 0, 3);
            }
        }
    }
</script>
