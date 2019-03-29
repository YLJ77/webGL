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