//Vertex shader program
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_xformMatrix;\n' +
    'void main() {\n' +
    '   gl_Position = u_xformMatrix * a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'void main() {\n' +
    '   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' + // Set the color
    '}\n';

//Rotation angle
var ANGLE = 30.0;
var Tx = 0.5, Ty = 0.5, Tz = 0.0;
var Sx = 0.5, Sy = 0.5, Sz = 0.5

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

    //Pass the data required to rotate the shape to the vertex shader
    var radian = Math.PI * ANGLE / 180.0;  //Convert to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    //Note: WebGL is column major order
    var xformMatrix = new Float32Array([
        Sx*cosB, sinB, 0.0, 0.0,
        -sinB, Sy*cosB, 0.0, 0.0,
        0.0, 0.0, Sz*1.0, 0.0,
        Tx, Ty, Tz, 1.0
    ]);

    //Pass the rotation matrix to the vertex shader
    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

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
