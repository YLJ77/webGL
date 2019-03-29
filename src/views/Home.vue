<template>
    <canvas id="webgl" width="400" height="400">
        Please use a browser that supports "canvas"
    </canvas>
</template>


<script>
    import { createProgram } from "../util/appFunc";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null,
                VSHADER_SOURCE:
                    'void main() {\n' +
                    '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the vertex coordinates of the point
                    '  gl_PointSize = 10.0;\n' +                    // Set the point size
                    '}\n',

                // Fragment shader program
                FSHADER_SOURCE:
                    'void main() {\n' +
                    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Set the point color
                    '}\n'
            }
        },
        methods: {
            init() {
                // Retrieve <canvas> element
                this.canvas = document.getElementById('webgl');
                // Get the rendering context for WebGL
                this.ctx = this.canvas.getContext('webgl');
            },
            draw() {
                let { ctx, VSHADER_SOURCE, FSHADER_SOURCE } = this;
                let program = createProgram({ ctx, vSource: VSHADER_SOURCE, fSource: FSHADER_SOURCE });

                // Specify the color for clearing <canvas>
                ctx.clearColor(0.0, 0.0, 0.0, 1.0);

                // Clear <canvas>
                ctx.clear(ctx.COLOR_BUFFER_BIT);

                // Draw a point
                ctx.drawArrays(ctx.POINTS, 0, 1);
            }
        },
        mounted() {
            this.init();
            this.draw();
        }
    }
</script>
