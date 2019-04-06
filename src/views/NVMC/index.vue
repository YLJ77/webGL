<template>
    <canvas
            id="OUTPUT-CANVAS"
            width="500px"
            height="500px"
            style="border: 1px solid black "
    ></canvas>
</template>
<script>
    //  base skeleton
    /*
    setupWebGL () { }
    setupWhatToDraw () { }
    setupHowToDraw () { }
    draw () { }

    helloDraw () {
        setupWebGL ();
        setupWhatToDraw ();
        setupHowToDraw ();
        draw ();
     }
    */
    export default {
        data() {
            return {
                gl: null,
                canvas: null
            }
        },
        methods: {
            setupWebGL () {
                this.canvas = document.getElementById("OUTPUT-CANVAS");
                this.gl = canvas.getContext("webgl");
            }
        }
    }
</script>