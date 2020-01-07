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
    import { initVertexBuffers } from "@/util/appFunc";
    import VS from '@/views/lookAtTriangles/shaders/triangle.vert'
    import FS from '@/views/lookAtTriangles/shaders/triangle.frag'
    import { mat4, vec3 } from 'gl-matrix'

    export default {
        data() {
            const eyeVec3 = vec3.set(vec3.create(), 0, 0, 5);
            const atVec3 = vec3.set(vec3.create(), 0, 0, -100);
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
                const { initUpVec3, initAtVec3, initEyeVec3, webglInfo: { gl, modelMatrix } } = this;
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
                this.drawShape({ modelMatrix, gl });
                this.curLookAtVec = { vec, axis };
            },
            main(gl) {
                const vertices = new Float32Array([
                    // Vertex coordinates and color
                    0.0, 1.0, 0.0, 0.4, 0.4, 1.0, // The front blue triangle
                    -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
                    0.5, -1.0, 0.0, 1.0, 0.4, 0.4,

                    0.0, 1.0, -4.0, 0.4, 1.0, 0.4, // The back green triangle
                    -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
                    0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

                    0.0, 1.0, -2.0, 1.0, 1.0, 0.4, // The middle yellow triangle
                    -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
                    0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

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
                const rotateMatrix = mat4.fromZRotation(mat4.create(), Math.PI/180 * 10);
                this.drawShape({ modelMatrix: rotateMatrix, gl });
                this.webglInfo = {
                    gl,
                    modelMatrix: rotateMatrix
                };
            },
            drawShape({ modelMatrix, gl }) {
                const { eyeVec3, atVec3, upVec3 } = this;
                const { canvas } = gl;
                const u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
                const viewMatrix = mat4.lookAt(mat4.create(), eyeVec3, atVec3, upVec3);
                const perspectiveMatrix = mat4.perspective(mat4.create(), Math.PI/180 * 30, canvas.width/canvas.height, this.near, this.far);
                let translateMatrix = mat4.translate(mat4.clone(modelMatrix), modelMatrix, vec3.set(vec3.create(), -0.75, 0, 0));
                let modelViewMatrix = mat4.multiply(mat4.create(), perspectiveMatrix, mat4.multiply(mat4.create(),viewMatrix, translateMatrix));
                gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix);
                gl.enable(gl.DEPTH_TEST);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, 9);
                translateMatrix = mat4.translate(mat4.clone(modelMatrix), modelMatrix, vec3.set(vec3.create(), 0.75, 0, 0));
                modelViewMatrix = mat4.multiply(mat4.create(), perspectiveMatrix, mat4.multiply(mat4.create(),viewMatrix, translateMatrix));
                gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix);
                gl.drawArrays(gl.TRIANGLES, 0, 9);
            }
        }
    }
</script>
