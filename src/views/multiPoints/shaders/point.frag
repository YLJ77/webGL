precision mediump float;
uniform float u_Width;
uniform float u_Height;
uniform vec4 u_FragColor;
void main() {
//    gl_FragColor = u_FragColor;
    gl_FragColor =  vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
}