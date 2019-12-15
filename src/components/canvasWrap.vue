<template>
    <div>
        <canvas v-on="$listeners" ref="canvas" width="400" height="400">Please use a browser that supports "canvas"</canvas>
    </div>
</template>

<script>
    import { initShader } from "@/util/appFunc";

    export default {
        props: {
            vSource: {
                type: String,
                required: true
            },
            fSource: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                points: [],
                gl: null
            }
        },
        methods: {
            main() {
                const { vSource, fSource } = this;
                const gl = this.$refs.canvas.getContext('webgl');
                initShader({ gl, vSource, fSource });
                this.gl = gl;
                // Specify the color for clearing <canvas>
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                // Clear <canvas>
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        },
        mounted() {
            this.main();
        }
    }
</script>
