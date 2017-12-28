//Vertex shader program
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = a_PointSize;\n' +
    //'   gl_Position = vec4(0.0, 0.5, 0.0, 1.0);\n' + // Coordinates
    //'   gl_PointSize = 10.0;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + // uniform variable
    'void main() {\n' +
    '   gl_FragColor = u_FragColor;\n' +
    //'   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' + // Set the color
    '}\n';

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

    //Get the storage location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    //Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, a_Position, u_FragColor);
    };


    //Set the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Pass vertex position to attribute variable
    gl.vertexAttrib3f(a_Position, 0.5, 0.0, 0.0);
    gl.vertexAttrib1f(a_PointSize, 10.0);

    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);


    // Draw a point
 //    gl.drawArrays(gl.POINTS, 0, 10);
}



var g_points = [];  //The array for a mouse press
var g_colors = [];  //The array to store the color of a point
function click(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX;  // x coordinate of a mouse pointer
    var y = ev.clientY;  // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
    // Store the coordinates to g_points array
    g_points.push([x, y]);
    // Store the color to g_colors array
    if (x >= 0.0 && y >= 0.0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    } else if (x < 0.0 && y < 0.0) {  // Third quadrant
        g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    } else {  // Others
        g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    }

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (var i=0; i<len; i++) {
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, g_points[i][0], g_points[i][1], 0.0);
        gl.uniform4f(u_FragColor,g_colors[i][0],g_colors[i][1],g_colors[i][2],g_colors[i][3],);
        // Draw a point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
