//Vertex shader program
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'uniform vec4 u_Translation;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position + u_Translation;\n' +
    //'   gl_PointSize = 10.0;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'void main() {\n' +
    '   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' + // Set the color
    '}\n';

//The translation distance for x, y, and z direction
var Tx = 0.5, Ty = 0.5, Tz = 0.0;

function main() {
    //Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    //Get the rendering contect for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    
    //Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    // Set the position of vertices
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    //Pass th translation distance to the vertex shader
    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
    gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

    //Set the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw three points
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);  //n is 3
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
        /*
        -0.5, 0.5,
        -0.5, -0.5,
        0.5, 0.5,
        0.5, -0.5
        */
    ]);
    var n = 3;  //The number of vertices

    //Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    //Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    //Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}
