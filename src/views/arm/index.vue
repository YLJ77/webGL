<template>
    <div>
        <canvas-wrap @onProgramLoaded="main" ref="canvasWrap" :v-source="VS" :f-source="FS"></canvas-wrap>
    </div>
</template>

<script>
    import { initVertexBuffers, compose } from "@/util/appFunc";
    import VS from '@/views/arm/shaders/arm.vert'
    import FS from '@/views/arm/shaders/arm.frag'
    import { mat4, vec3 } from 'gl-matrix'

    export default {
        data() {
            const eyeVec3 = vec3.set(vec3.create(), 20, 10, 30);
            const atVec3 = vec3.set(vec3.create(), 0, 0, 0);
            const upVec3 = vec3.set(vec3.create(), 0, 1, 0);
            const initEyeVec3 = vec3.clone(eyeVec3);
            const initAtVec3 = vec3.clone(atVec3);
            const initUpVec3 = vec3.clone(upVec3);
            return {
                angle: {
                    step: 3.0,
                    arm1: 90,
                    joint1: 45.0,
                    joint2: 0,
                    joint3: 0
                },
                matrix: {
                    model: mat4.create(),
                    mvp: mat4.create()
                },
                VS,
                FS,
                webglInfo: null,
                curLookAtVec: {
                    vec: 'eyeVec3',
                    axis: 'x'
                },
                eyeVec3,
                atVec3,
                upVec3,
                initUpVec3,
                initAtVec3,
                initEyeVec3,
                near: 1,
                far: 100
            }
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        },
        mounted() {
            document.addEventListener('keydown', e => {
                e.preventDefault();
                const { keyCode } = e;
                const { angle, webglInfo } = this;
                const maxAngle = 135;
                switch (keyCode) {
                    case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
                        if (angle.joint1 < maxAngle) angle.joint1 += angle.step;
                        break;
                    case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
                        if (angle.joint1 > maxAngle * -1)angle.joint1 -= angle.step;
                        break;
                    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
                        angle.arm1 += angle.step;
                        break;
                    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
                        angle.arm1 -= angle.step;
                        break;
                    case 90: // Z key -> the positive rotation of joint2
                        angle.joint2 += angle.step;
                        break;
                    case 88: // X key -> the negative rotation of joint2
                        angle.joint2 -= angle.step;
                        break;
                    case 86: // V key -> the positive rotation of joint3
                        if (angle.joint3 < 60.0) angle.joint3 += angle.step;
                        break;
                    case 67: // C key -> the negative rotation of joint3
                        if (angle.joint3 > -60.0) angle.joint3 -= angle.step;
                        break;
                    default: return; // Skip drawing at no effective action
                }
                this.drawShape(webglInfo);
            });
        },
        methods: {
            main(gl) {
                const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
                const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
                const u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
                const u_AmbientLightColor = gl.getUniformLocation(gl.program, 'u_AmbientLightColor');
                const lightDirection = vec3.normalize(vec3.create(), vec3.set(vec3.create(),0.5, 3.0, 4.0));
                gl.uniform3f(u_AmbientLightColor, 0.2, 0.2, 0.2);
                // Set the light color (white)
                gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
                // Set the light direction (in the world coordinate)
                gl.uniform3fv(u_LightDirection, lightDirection);
                // Set the light direction (in the world coordinate)
                gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
                // Create a cube
                //    v6----- v5
                //   /|      /|
                //  v1------v0|
                //  | |     | |
                //  | |v7---|-|v4
                //  |/      |/
                //  v2------v3
                const vertices = new Float32Array([   // Coordinates
                    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
                    1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
                    1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
                    -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
                    -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
                    1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
                ]);
                const colors = new Float32Array([    // Colors
                    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
                    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
                    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
                    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
                    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
                    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
                ]);
                const normals = new Float32Array([    // Normal
                    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
                    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
                    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
                    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
                    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
                    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
                ]);
                // Indices of the vertices
                const indices = new Uint8Array([
                    0, 1, 2,   0, 2, 3,    // front
                    4, 5, 6,   4, 6, 7,    // right
                    8, 9,10,   8,10,11,    // up
                    12,13,14,  12,14,15,    // left
                    16,17,18,  16,18,19,    // down
                    20,21,22,  20,22,23     // back
                ]);
                const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
                const u_ModalMatrix = gl.getUniformLocation(gl.program, 'u_ModalMatrix');
                const { eyeVec3, atVec3, upVec3 } = this;
                const { canvas } = gl;
                const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
                const viewMatrix = mat4.lookAt(mat4.create(), eyeVec3, atVec3, upVec3);
                const perspectiveMatrix = mat4.perspective(mat4.create(), Math.PI/180 * 50, canvas.width/canvas.height, this.near, this.far);
                let viewProjMatrix = mat4.multiply(mat4.create(), perspectiveMatrix, viewMatrix);
                const FSIZE = vertices.BYTES_PER_ELEMENT;
                initVertexBuffers({
                    gl,
                    isSplitMode: true,
                    program: gl.program,
                    verticesInfo: [
                        {
                            attrVar: 'a_Position',
                            vertice: vertices,
                            size: 3
                        },
/*                        {
                            attrVar: 'a_Color',
                            vertice: colors,
                            size: 3
                        },*/
                        {
                            attrVar: 'a_Normal',
                            vertice: normals,
                            size: 3
                        },
                    ],
                    indices
                });
                // Set the clear color and enable the depth test
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                this.drawShape({  gl, viewProjMatrix, u_MvpMatrix, u_NormalMatrix });
                this.webglInfo = { gl, viewProjMatrix, u_MvpMatrix, u_NormalMatrix };
            },
            drawShape({ gl, viewProjMatrix, u_MvpMatrix, u_NormalMatrix }) {
                const { matrix: { model }, angle } = this;
                // Clear color and depth buffer
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Arm1
                const arm1Length = 10.0; // Length of arm1
                mat4.fromTranslation(model, vec3.set(vec3.create(), 0, -12, 0));
                mat4.rotateY(model, model, Math.PI/180 * angle.arm1);
                this.drawBox({ gl, viewProjMatrix, u_MvpMatrix, u_NormalMatrix });

                mat4.translate(model, model, vec3.set(vec3.create(), 0, arm1Length, 0));  // Move to joint1
                mat4.rotateZ(model, model, Math.PI/180 * angle.joint1);
                mat4.scale(model, model, vec3.set(vec3.create(), 1.3, 1.0, 1.3));
                this.drawBox({ gl, viewProjMatrix, u_MvpMatrix, u_NormalMatrix });

            },
            drawBox({ gl, viewProjMatrix, u_MvpMatrix, u_NormalMatrix }) {
                const { matrix: { model }, angle } = this;
                // Calculate the model view project matrix and pass it to u_MvpMatrix
                this.matrix.mvp = compose(
                    matrix => mat4.multiply(matrix, viewProjMatrix, model ),
                    () => mat4.create()
                )();
                gl.uniformMatrix4fv(u_MvpMatrix, false, this.matrix.mvp);
                // Calculate the normal transformation matrix and pass it to u_NormalMatrix
                const normalMatrix = mat4.create();
                mat4.invert(normalMatrix, this.matrix.model);
                mat4.transpose(normalMatrix, normalMatrix);
                gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix);
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
            }
        }
    }
</script>
