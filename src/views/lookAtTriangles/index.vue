<template>
    <div>
        <canvas-wrap @onProgramLoaded="main" ref="canvasWrap" :v-source="VS" :f-source="FS"></canvas-wrap>
    </div>
</template>

<script>
    import { initVertexBuffers } from "@/util/appFunc";
    import VS from '@/views/lookAtTriangles/shaders/triangle.vert'
    import FS from '@/views/lookAtTriangles/shaders/triangle.frag'
    import { mat4, vec3 } from 'gl-matrix'

    export default {
        data() {
            return {
                VS,
                FS,
            }
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        },
        methods: {
            main(gl) {
                const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
                const eyeVec3 = vec3.set(vec3.create(), 0.20, 0.25, 0.25);
                const atVec3 = vec3.set(vec3.create(), 0, 0, 0);
                const upVec3 = vec3.set(vec3.create(), 0, 1, 0);
                const viewMatrix = mat4.lookAt(mat4.create(), eyeVec3, atVec3, upVec3);
                const vertices = new Float32Array([
                    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // The back green triangle
                    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
                    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

                    0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // The middle yellow triangle
                    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
                    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

                    0.0, 0.5, 0.0, 0.4, 0.4, 1.0, // The front blue triangle
                    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
                    0.5, -0.5, 0.0, 1.0, 0.4, 0.4
                ]);
                const FSIZE = vertices.BYTES_PER_ELEMENT;
                initVertexBuffers({
                    gl,
                    program: gl.program,
                    vertices,
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
                        },
                    ]
                });
                gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
                gl.drawArrays(gl.TRIANGLES, 0, 9);
            }
        }
    }
</script>
