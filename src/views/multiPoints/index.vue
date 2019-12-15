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
    import { mat4, vec3 } from 'gl-matrix'

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
                const ANGLE = 60.0;
                // Pass the data required to rotate the shape to the vertex shader
                const radian = Math.PI * ANGLE / 180.0; // Convert to radians
                // Create Matrix4 object for a rotation matrix
                const xformMatrix = mat4.create();
                mat4.rotateZ(xformMatrix, xformMatrix, radian);
                mat4.translate(xformMatrix, xformMatrix, vec3.set(vec3.create(),0.5,0.5,0))
                // Pass the rotation matrix to the vertex shader
                gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix );

                // Pass the rotation matrix to the vertex shader
                const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
                gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
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
