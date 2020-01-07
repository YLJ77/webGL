precision mediump float;
uniform vec4 u_FragColor;
varying vec4 v_Color;
void main() {
//    gl_FragColor = u_FragColor;
    gl_FragColor = v_Color;
}