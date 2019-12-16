precision mediump float;
varying vec2 v_TexCoord;
uniform sampler2D u_Sampler;
void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}