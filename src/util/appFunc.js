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

export function initVertexBuffers({ ctx, vertices, attrVar, program }) {
    // Bind the buffer object to target
    ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
    // Write date into the buffer object
    ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

    let a_Position = ctx.getAttribLocation(program, attrVar);
    // Assign the buffer object to a_Position variable
    ctx.vertexAttribPointer(a_Position, 2, ctx.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    ctx.enableVertexAttribArray(a_Position);

    return vertices.length / 2;
}
