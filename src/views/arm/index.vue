<template>
    <div>
        <canvas-wrap @onProgramLoaded="main"
                     @mousedown="down"
                     @mouseup="up"
                     @mousemove="move"
                     :v-source="VS"
                     :f-source="FS"></canvas-wrap>
        <ul style="list-style: none;text-align: left;">
            <li>1)⬅➡⬆⬇: 调整角度</li>
            <li>2)zxcv: 调整手掌、手指角度</li>
            <li>3)鼠标拖拽旋转</li>
            <li>4)选中手臂改变颜色</li>
        </ul>
    </div>
</template>

<script>
    import { initVertexBuffers, compose, waitToLoad } from "@/util/appFunc";
    import VS from '@/views/arm/shaders/arm.vert'
    import FS from '@/views/arm/shaders/arm.frag'
    import { mat4, vec3 } from 'gl-matrix'
    import MatrixCtx from './MatrixCtx'

    export default {
        data() {
            const eyeVec3 = vec3.set(vec3.create(), 20, 10, 30);
            const atVec3 = vec3.set(vec3.create(), 0, 0, 0);
            const upVec3 = vec3.set(vec3.create(), 0, 1, 0);
            const initEyeVec3 = vec3.clone(eyeVec3);
            const initAtVec3 = vec3.clone(atVec3);
            const initUpVec3 = vec3.clone(upVec3);
            return {
                matrixCtx: new MatrixCtx(),
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
                far: 300,
                mouse: {
                    dragging: false,
                    lastX: -1,
                    lastY: -1,
                    deltaXAngle: 0,
                    deltaYAngle: 0
                }
            }
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        },
        mounted() {
            this.addKeyEvent();
            waitToLoad(() => this.webglInfo).then(() => {
                this.animate();
            });
        },
        methods: {
            getReadPixelCoordinate(e) {
                const { clientX: x, clientY: y, target } = e;
                const rect = target.getBoundingClientRect();
                return {
                    x: x - rect.left,
                    y: rect.bottom - y
                }
            },
            checkIsPicked(e) {
                const { x, y } = this.getReadPixelCoordinate(e);
                const { webglInfo: { gl, u_Clicked } } = this;
                let picked = false;
                gl.uniform1i(u_Clicked, 1);  // Draw the arm with red
                this.draw();
                const pixels = new Uint8Array(4);   // Array for storing the pixels
                gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                if (pixels[0] === 255) picked = true;
                gl.uniform1i(u_Clicked, 0);  // Pass false to u_Clicked: redraw arm
                return picked;
            },
            // Start dragging if a mouse is in canvas
            down(e) {
                const { webglInfo: { gl, a_Color } } = this;
                const { clientX: x, clientY: y } = e;
                const isPicked = this.checkIsPicked(e);
                if (isPicked) {
                    gl.vertexAttrib3f(a_Color, Math.random(), Math.random(), Math.random());
                }
                this.draw();

                this.mouse.lastX = x;
                this.mouse.lastY = y;
                this.mouse.dragging = true;
            },
            up() {
                this.mouse.dragging = false; // Mouse is released
            },
            move(e) {
                const { clientX: x, clientY: y } = e;
                const { mouse: { dragging, lastX, lastY }, webglInfo: { gl } } = this;
                if (dragging) {
                    const factor = 100/gl.canvas.height;
                    const dx = factor * (x - lastX);
                    const dy = factor * (y - lastY);
                    this.mouse.deltaXAngle += dy;
                    this.mouse.deltaYAngle += dx;
                }
                this.mouse.lastX = x;
                this.mouse.lastY = y;
            },
            animate() {
                this.draw();
                requestAnimationFrame(this.animate);
            },
            addKeyEvent() {
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
                    this.draw(webglInfo);
                });
            },
            main(gl) {
                // Initialize selected surface
                const u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
                const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
                const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
                const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
                const u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
                const u_AmbientLightColor = gl.getUniformLocation(gl.program, 'u_AmbientLightColor');
                const lightDirection = vec3.normalize(vec3.create(), vec3.set(vec3.create(),0.5, 3.0, 4.0));
                gl.vertexAttrib3f(a_Color, 1, 0, 0.7);
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
                    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
                    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
                    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
                    -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
                    -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
                    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
                ]);
                const colors = new Float32Array([    // Colors
                    1, 0.4, 0,   1, 0.4, 0,   1, 0.4, 0,  1, 0.4, 0,     // v0-v1-v2-v3 front
                    1, 0.4, 0,   1, 0.4, 0,   1, 0.4, 0,  1, 0.4, 0,     // v0-v3-v4-v5 right
                    1, 0.4, 0,   1, 0.4, 0,   1, 0.4, 0,  1, 0.4, 0,     // v0-v5-v6-v1 up
                    1, 0.4, 0,   1, 0.4, 0,   1, 0.4, 0,  1, 0.4, 0,     // v1-v6-v7-v2 left
                    1, 0.4, 0,   1, 0.4, 0,   1, 0.4, 0,  1, 0.4, 0,     // v7-v4-v3-v2 down
                    1, 0.4, 0,   1, 0.4, 0,   1, 0.4, 0,  1, 0.4, 0　    // v4-v7-v6-v5 back
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
                this.webglInfo = {
                    gl,
                    viewProjMatrix,
                    u_MvpMatrix,
                    u_NormalMatrix,
                    u_ModalMatrix,
                    u_Clicked,
                    a_Color
                };
                this.draw();
            },
            draw() {
                let {
                    matrixCtx,
                    matrix: { model: modelMatrix },
                    angle,
                    webglInfo: { gl },
                    mouse: {
                        deltaXAngle,
                        deltaYAngle
                    }
                } = this;
                // Clear color and depth buffer
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Draw a base
                const baseHeight = 2.0;
                mat4.fromTranslation(modelMatrix, vec3.set(vec3.create(), 0, -12, 0));
                mat4.rotateX(modelMatrix, modelMatrix, Math.PI/180 * deltaXAngle);  // Rotation around x-axis
                mat4.rotateY(modelMatrix, modelMatrix, Math.PI/180 * deltaYAngle);  // Rotation around y-axis
                matrixCtx.save(modelMatrix);
                mat4.scale(modelMatrix, modelMatrix, vec3.set(vec3.create(), 10, baseHeight, 10));
                this.drawBox({ modelMatrix });
                modelMatrix = matrixCtx.restore();

                // Arm1
                const arm1Length = 10.0; // Length of arm1
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0, baseHeight, 0.0));  // Move onto the base
                mat4.rotateY(modelMatrix, modelMatrix, Math.PI/180 * angle.arm1);
                matrixCtx.save(modelMatrix);
                mat4.scale(modelMatrix, modelMatrix, vec3.set(vec3.create(), 3, arm1Length, 3));
                this.drawBox({ modelMatrix });
                modelMatrix = matrixCtx.restore();

                // Arm2
                const arm2Length = 10.0;
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0, arm1Length, 0.0));
                mat4.rotateZ(modelMatrix, modelMatrix, Math.PI/180 * angle.joint1);
                matrixCtx.save(modelMatrix);
                mat4.scale(modelMatrix, modelMatrix, vec3.set(vec3.create(), 4, arm2Length, 4));
                this.drawBox({ modelMatrix });
                modelMatrix = matrixCtx.restore();

                // A palm
                const palmLength = 2.0;
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0, arm2Length, 0.0));
                mat4.rotateY(modelMatrix, modelMatrix, Math.PI/180 * angle.joint2);
                matrixCtx.save(modelMatrix);
                mat4.scale(modelMatrix, modelMatrix, vec3.set(vec3.create(), 2, palmLength, 6));
                this.drawBox({ modelMatrix });
                modelMatrix = matrixCtx.restore();

                // Move to the center of the tip of the palm
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0, palmLength, 0.0));

                // finger1
                const fingerLength = 2;
                matrixCtx.save(modelMatrix);
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0, 0, fingerLength));
                mat4.rotateX(modelMatrix, modelMatrix, Math.PI/180 * angle.joint3);
                mat4.scale(modelMatrix, modelMatrix, vec3.set(vec3.create(), 1, fingerLength, 1));
                this.drawBox({ modelMatrix });
                modelMatrix = matrixCtx.restore();

                // finger2
                matrixCtx.save(modelMatrix);
                mat4.translate(modelMatrix, modelMatrix, vec3.set(vec3.create(), 0, 0, -fingerLength));
                mat4.rotateX(modelMatrix, modelMatrix, -Math.PI/180 * angle.joint3);
                mat4.scale(modelMatrix, modelMatrix, vec3.set(vec3.create(), 1, fingerLength, 1));
                this.drawBox({ modelMatrix });
                modelMatrix = matrixCtx.restore();
            },
            drawBox({ modelMatrix }) {
                const {
                    webglInfo: {
                         gl,
                        viewProjMatrix,
                        u_MvpMatrix,
                        u_NormalMatrix,
                        u_ModalMatrix
                    }
                } = this;
                // Calculate the modelMatrix view project matrix and pass it to u_MvpMatrix
                this.matrix.mvp = compose(
                    matrix => mat4.multiply(matrix, viewProjMatrix, modelMatrix ),
                    () => mat4.create()
                )();
                gl.uniformMatrix4fv(u_MvpMatrix, false, this.matrix.mvp);
                // Calculate the normal transformation matrix and pass it to u_NormalMatrix
                const normalMatrix = mat4.create();
                mat4.invert(normalMatrix, modelMatrix);
                mat4.transpose(normalMatrix, normalMatrix);
                gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix);
                gl.uniformMatrix4fv(u_ModalMatrix, false, modelMatrix);
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
            }
        }
    }
</script>
