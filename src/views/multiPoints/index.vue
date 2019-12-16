<template>
    <div>
        <canvas-wrap @onProgramLoaded="main" ref="canvasWrap" :v-source="pointVS" :f-source="pointFS"></canvas-wrap>
    </div>
</template>

<script>
    import { initVertexBuffers } from "@/util/appFunc";
    import pointVS from '@/views/multiPoints/shaders/point.vert'
    import pointFS from '@/views/multiPoints/shaders/point.frag'
    import { mat4, vec3 } from 'gl-matrix'

    export default {
        data() {
            return {
                pointVS,
                pointFS,
                curAngle: 0
            }
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        },
        methods: {
            draw({ gl, n, modelMatrix, u_modelMatrix }) {
                this.curAngle += 1;
                // Set up rotation matrix
                mat4.fromZRotation(modelMatrix, Math.PI/180 * this.curAngle);
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0.35, 0, 0));

                // Pass the rotation matrix to the vertex shader
                gl.uniformMatrix4fv( u_modelMatrix, false, modelMatrix);

                // Clear <canvas>
                gl.clear(gl.COLOR_BUFFER_BIT);

                // Draw a triangle
                gl.drawArrays(gl.TRIANGLES, 0, n);
            },
            main(gl) {
                const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
                const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
                const u_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
                // Create Matrix4 object for a rotation matrix
                const modelMatrix = mat4.create();
/*                mat4.fromZRotation(modelMatrix, radian);
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(),0.5,0,0));*/
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
                // Pass the rotation matrix to the vertex shader
                gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix);
                gl.uniform4fv(u_FragColor, new Float32Array([1.0,0,1,1]));
                gl.vertexAttrib1f(a_PointSize, 10);
                const tick = () => {
                    this.draw({ gl, n: 3, modelMatrix, u_modelMatrix });
                    requestAnimationFrame(tick);// Request that the browser calls tick
                };
                tick();
            }
        }
    }
</script>
