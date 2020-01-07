<template>
    <div>
        <p>{{ `near: ${near}, far: ${far}` }}</p>
        <ul>
            <li>
                <a-button-group>
                    <a-button @click="draw({ actionType: 'add', axis: 'near' })">near +</a-button>
                    <a-button @click="draw({ actionType: 'subtract', axis: 'near' })">near -</a-button>
                    <a-button @click="draw({ actionType: 'add', axis: 'far' })">far +</a-button>
                    <a-button @click="draw({ actionType: 'subtract', axis: 'far' })">far -</a-button>
                </a-button-group>
            </li>
            <li>
                <a-button-group>
                    <a-button @click="draw({ vec: 'eyeVec3', actionType: 'add', axis: 'x' })">eyeX +</a-button>
                    <a-button @click="draw({ vec: 'eyeVec3', actionType: 'subtract', axis: 'x' })">eyeX -</a-button>
                    <a-button @click="draw({ vec: 'eyeVec3', actionType: 'add', axis: 'y' })">eyeY +</a-button>
                    <a-button @click="draw({ vec: 'eyeVec3', actionType: 'subtract', axis: 'y' })">eyeY -</a-button>
                    <a-button @click="draw({ vec: 'eyeVec3', actionType: 'add', axis: 'z' })">eyeZ +</a-button>
                    <a-button @click="draw({ vec: 'eyeVec3', actionType: 'subtract', axis: 'z' })">eyeZ -</a-button>
                </a-button-group>
            </li>
            <li>
                <a-button-group>
                    <a-button @click="draw({ vec: 'atVec3', actionType: 'add', axis: 'x' })">atX +</a-button>
                    <a-button @click="draw({ vec: 'atVec3', actionType: 'subtract', axis: 'x' })">atX -</a-button>
                    <a-button @click="draw({ vec: 'atVec3', actionType: 'add', axis: 'y' })">atY +</a-button>
                    <a-button @click="draw({ vec: 'atVec3', actionType: 'subtract', axis: 'y' })">atY -</a-button>
                    <a-button @click="draw({ vec: 'atVec3', actionType: 'add', axis: 'z' })">atZ +</a-button>
                    <a-button @click="draw({ vec: 'atVec3', actionType: 'subtract', axis: 'z' })">atZ -</a-button>
                </a-button-group>
            </li>
            <li>
                <a-button-group>
                    <a-button @click="draw({ vec: 'upVec3', actionType: 'add', axis: 'x' })">upX +</a-button>
                    <a-button @click="draw({ vec: 'upVec3', actionType: 'subtract', axis: 'x' })">upX -</a-button>
                    <a-button @click="draw({ vec: 'upVec3', actionType: 'add', axis: 'y' })">upY +</a-button>
                    <a-button @click="draw({ vec: 'upVec3', actionType: 'subtract', axis: 'y' })">upY -</a-button>
                    <a-button @click="draw({ vec: 'upVec3', actionType: 'add', axis: 'z' })">upZ +</a-button>
                    <a-button @click="draw({ vec: 'upVec3', actionType: 'subtract', axis: 'z' })">upZ -</a-button>
                </a-button-group>
            </li>
            <li>
                <a-button @click="draw({ actionType: 'reset' })" type="primary">重置</a-button>
            </li>
        </ul>
        <canvas-wrap @onProgramLoaded="main" ref="canvasWrap" :v-source="VS" :f-source="FS"></canvas-wrap>
    </div>
</template>

<script>
    import { initVertexBuffers, compose } from "@/util/appFunc";
    import VS from '@/views/cube/shaders/cube.vert'
    import FS from '@/views/cube/shaders/cube.frag'
    import { mat4, vec3 } from 'gl-matrix'

    export default {
        data() {
            const eyeVec3 = vec3.set(vec3.create(), 6, 6, 4);
            const atVec3 = vec3.set(vec3.create(), 0, 0, 0);
            const upVec3 = vec3.set(vec3.create(), 0, 1, 0);
            const initEyeVec3 = vec3.clone(eyeVec3);
            const initAtVec3 = vec3.clone(atVec3);
            const initUpVec3 = vec3.clone(upVec3);
            return {
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
                const { curLookAtVec: { vec, axis } } = this;
                if (keyCode === 38) { // up
                    this.draw({ vec, axis, actionType: 'add' });
                } else if (keyCode === 40) {  // down
                    this.draw({ vec, axis, actionType: 'subtract' });
                }
            });
        },
        methods: {
            draw({ vec, actionType, axis }) {
                const { initUpVec3, initAtVec3, initEyeVec3, webglInfo: { gl } } = this;
                const { canvas } = gl;
                if (actionType === 'reset') {
                    this.eyeVec3 = vec3.clone(initEyeVec3);
                    this.atVec3 = vec3.clone(initAtVec3);
                    this.upVec3 = vec3.clone(initUpVec3);
                    this.near = 1;
                    this.far = 100;
                } else {
                    if (['x', 'y', 'z'].includes(axis)) {
                        const operandVec = vec3.set(vec3.create(),
                            axis === 'x' ? 0.01 : 0,
                            axis === 'y' ? 0.01 : 0,
                            axis === 'z' ? 0.01 : 0,
                        );
                        vec3[actionType](this[vec], this[vec], operandVec);
                    } else if (['near', 'far'].includes(axis)) {
                        const actionTypeMapSign = {
                            add: 1,
                            subtract: -1,
                        };
                        this[axis] += 1 * actionTypeMapSign[actionType];
                    }
                }
                this.drawShape({ gl });
                this.curLookAtVec = { vec, axis };
            },
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
                const vertices = new Float32Array([   // Coordinates
                    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
                    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
                    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
                    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
                    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
                    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
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
                        {
                            attrVar: 'a_Color',
                            vertice: colors,
                            size: 3
                        },
                        {
                            attrVar: 'a_Normal',
                            vertice: normals,
                            size: 3
                        },
                    ],
                    indices
                });
                const rotateMatrix = mat4.fromZRotation(mat4.create(), Math.PI/180 * 60);
                this.drawShape({ modelMatrix: rotateMatrix, gl });
                this.webglInfo = {
                    gl,
                    modelMatrix: rotateMatrix
                };
            },
            drawShape({ gl }) {
                const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
                const u_ModalMatrix = gl.getUniformLocation(gl.program, 'u_ModalMatrix');
                const { eyeVec3, atVec3, upVec3 } = this;
                const { canvas } = gl;
                const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
                const viewMatrix = mat4.lookAt(mat4.create(), eyeVec3, atVec3, upVec3);
                const perspectiveMatrix = mat4.perspective(mat4.create(), Math.PI/180 * 30, canvas.width/canvas.height, this.near, this.far);
                const modelMatrix = compose(
                    ({ rotateMat, matrix, vec }) => mat4.translate(matrix, rotateMat, vec),
                    rotateMat => {
                        return {
                            rotateMat,
                            matrix: mat4.create(),
                            vec: vec3.set(vec3.create(), 0.75, 0, 0)
                        }
                    },
                    matrix => mat4.fromYRotation(matrix, Math.PI/180 * 90),
                    () => mat4.create()
                )();
                let mvpMatrix = mat4.multiply(mat4.create(), perspectiveMatrix, mat4.multiply(mat4.create(),viewMatrix, modelMatrix));
                const normalMatrix = compose(
                    matrix => mat4.transpose(mat4.create(), matrix),
                    matrix => mat4.invert(matrix, modelMatrix),
                    () => mat4.create()
                )();
                gl.uniformMatrix4fv(u_ModalMatrix, false, modelMatrix);
                gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
                gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
            }
        }
    }
</script>
