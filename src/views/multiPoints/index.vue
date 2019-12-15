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
                const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
                const u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
                // Rotation angle
                const ANGLE = 30.0;
                // Pass the data required to rotate the shape to the vertex shader
                const radian = Math.PI * ANGLE / 180.0; // Convert to radians
                const cosB = Math.cos(radian);
                const sinB = Math.sin(radian);

                const xformMatrix = new Float32Array([
                    cosB, sinB, 0.0, 0.0,
                    -sinB, 1.5*cosB, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    0.5, 0.5, 0.0, 1.0
                ]);

                // Pass the rotation matrix to the vertex shader
                const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
                gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
/*                const u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
                const u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
                gl.uniform1f(u_CosB, cosB);
                gl.uniform1f(u_SinB, sinB);*/
                gl.uniform4fv(u_FragColor, new Float32Array([1.0,1,0,1.0]));
                gl.uniform4f(u_Translation, 0.5, 0.5, 0, 0.0);
                gl.vertexAttrib1f(a_PointSize, 10);
                initVertexBuffers({
                   gl,
                   vertices: new Float32Array([0.0, 0.5,   -0.5, -0.5,   0.5, -0.5]),
                   //  vertices: new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]),
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
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
            }
        }
    }
</script>
