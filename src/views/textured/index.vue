<template>
    <div>
        <canvas-wrap @onProgramLoaded="main" ref="canvasWrap" :v-source="VS" :f-source="FS"></canvas-wrap>
    </div>
</template>

<script>
    import { initVertexBuffers, initTextures } from "@/util/appFunc";
    import VS from '@/views/textured/shaders/textured.vert'
    import FS from '@/views/textured/shaders/textured.frag'
    export default {
        data() {
            return {
                VS,
                FS
            }
        },
        methods: {
            main(gl) {
                const vertices = new Float32Array([
                    // Vertex coordinates, texture coordinate
                    -0.5,  0.5,   0.0, 1.0,
                    -0.5, -0.5,   0.0, 0.0,
                    0.5,  0.5,   1.0, 1.0,
                    0.5, -0.5,   1.0, 0.0,
/*                    -0.5, 0.5, -0.3, 1.7,
                    -0.5, -0.5, -0.3, -0.2,
                    0.5, 0.5, 1.7, 1.7,
                    0.5, -0.5, 1.7, -0.2*/
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
                            stride: FSIZE * 4,
                            offset: 0
                        },
                        {
                            attrVar: 'a_TexCoord',
                            size: 2,
                            stride: FSIZE * 4,
                            offset: FSIZE * 2
                        }
                    ]
                });
                initTextures({
                    gl,
                    program: gl.program,
                    uniformVar: 'u_Sampler0',
                    imgSrc: './timg.jpg',
                    count: 4,
                    canDraw: false
                });
                initTextures({
                    gl,
                    program: gl.program,
                    uniformVar: 'u_Sampler1',
                    imgSrc: './circle.gif',
                    count: 4,
                    textUnit: 1,
                    canDraw: true
                });
            }
        },
        components: {
            canvasWrap: () => import('@/components/canvasWrap')
        }
    }
</script>
