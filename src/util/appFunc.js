export function loadShader({ gl, type, source }) {
    let shader = gl.createShader(gl[type]);
    // Set the shader program
    gl.shaderSource(shader, source);
    // Compile the shader
    gl.compileShader(shader);
    return shader;
}

export function initShader({ gl, vSource, fSource }) {
    // Initialize shaders
    let vertexShader = loadShader({ type: 'VERTEX_SHADER', source: vSource, gl });
    let fragmentShader = loadShader({ type: 'FRAGMENT_SHADER', source: fSource, gl });
    // Create a program object
    let program = gl.createProgram();
    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // Link the program object
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.program = program;
    return program;
}

export function windowToWebGL({x, y, canvas }) {
    let rect = canvas.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return { x, y }
}

export function windowToCanvas({ x, y, canvas }) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: rect.bottom - y
    }
}

export function initVertexBuffers({ gl, vertices, program, verticesInfo, indices }) {
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    verticesInfo.forEach(info => {
        let { attrVar, size, stride, offset } = info;
        let attrLoc = gl.getAttribLocation(program, attrVar);
        // Assign the buffer object to attrLoc variable
        gl.vertexAttribPointer(attrLoc, size, gl.FLOAT, false, stride, offset);
        // Enable the assignment to attrLoc variable
        gl.enableVertexAttribArray(attrLoc);
    });
    if (indices) {
        // Write the indices to the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }
}
export function initTextures({ gl, program, uniformVar, imgSrc, count, canDraw = true, textUnit = 0 }) {
    // Get the storage location of uniformVar
    let uniformLoc = gl.getUniformLocation(program, uniformVar);
    let image = new Image();  // Create the image object
    // Register the event handler to be called on loading an image
    image.onload = function(){ loadTexture({ gl, uniformLoc, image, count, canDraw, textUnit }); };
    // Tell the browser to load an image
    image.src = imgSrc;
}

export function loadTexture({ gl, uniformLoc, image, count, textUnit, canDraw }) {
    let texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl[`TEXTURE${ textUnit }`]);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(uniformLoc, textUnit);
    if (canDraw) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, count); // Draw the rectangle
    }
}


export function Vector3 (src) {
    let v = new Float32Array(3);
    src.forEach((ele, index) => {
       v[index] = ele;
    });
    this.elements = v;
}

/**
 * Normalize.
 * @return this
 */
Vector3.prototype.normalize = function() {
    let v = this.elements;
    let len = Math.sqrt(v.reduce((acc, cur) => { return acc += cur ** 2 }, 0));
    if(len){
        if(len === 1) return this;
    } else {
        v.forEach((ele, index) => v[index] = 0);
        return this;
    }
    len = 1/len;
    v.forEach((ele, index) => v[index] *= len);
    return this;
};

export function waitToLoad(fn) {
    const interVal = 50;
    const maxTime = 3000;
    let timer = 0;
    return new Promise(resolve => {
        const clockId = setInterval(() => {
            timer += interVal;
            const val = fn();
            if (val) {
                clearInterval(clockId);
                resolve(val);
            } else if (timer >= maxTime) {
                console.error(`wait to load: ${fn.toString()} 超时!`);
                clearInterval(clockId);
                resolve(null);
            }
        }, interVal);
    });
}
