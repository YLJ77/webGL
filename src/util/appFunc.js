export function loadShader({ ctx, type, source }) {
    let shader = ctx.createShader(ctx[type]);
    // Set the shader program
    ctx.shaderSource(shader, source);
    // Compile the shader
    ctx.compileShader(shader);
    return shader;
}

export function createProgram({ ctx, vSource, fSource }) {
    // Initialize shaders
    let vertexShader = loadShader({ type: 'VERTEX_SHADER', source: vSource, ctx });
    let fragmentShader = loadShader({ type: 'FRAGMENT_SHADER', source: fSource, ctx });
    // Create a program object
    let program = ctx.createProgram();
    // Attach the shader objects
    ctx.attachShader(program, vertexShader);
    ctx.attachShader(program, fragmentShader);

    // Link the program object
    ctx.linkProgram(program);
    ctx.useProgram(program);
    return program;
}

export function windowToCanvas({x, y, canvas }) {
    let rect = canvas.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return { x, y }
}

export function initVertexBuffers({ ctx, vertices, program, verticesInfo }) {
    // Bind the buffer object to target
    ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
    // Write date into the buffer object
    ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

    verticesInfo.forEach(info => {
        let { attrVar, size, stride, offset } = info;
        let attrLoc = ctx.getAttribLocation(program, attrVar);
        // Assign the buffer object to attrLoc variable
        ctx.vertexAttribPointer(attrLoc, size, ctx.FLOAT, false, stride, offset);
        // Enable the assignment to attrLoc variable
        ctx.enableVertexAttribArray(attrLoc);
    });
}
export function initTextures({ ctx, program, uniformVar, imgSrc, count, canDraw = true, textUnit = 0 }) {
    // Get the storage location of uniformVar
    var uniformLoc = ctx.getUniformLocation(program, uniformVar);
    var image = new Image();  // Create the image object
    // Register the event handler to be called on loading an image
    image.onload = function(){ loadTexture({ ctx, uniformLoc, image, count, canDraw, textUnit }); };
    // Tell the browser to load an image
    image.src = imgSrc;
}

export function loadTexture({ ctx, uniformLoc, image, count, textUnit, canDraw }) {
    let texture = ctx.createTexture();
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    ctx.activeTexture(ctx[`TEXTURE${ textUnit }`]);
    // Bind the texture object to the target
    ctx.bindTexture(ctx.TEXTURE_2D, texture);

    // Set the texture parameters
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    // Set the texture image
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    ctx.uniform1i(uniformLoc, textUnit);
    if (canDraw) {
        ctx.clear(ctx.COLOR_BUFFER_BIT);
        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, count); // Draw the rectangle
    }
}
