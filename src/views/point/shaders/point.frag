precision mediump float;
varying vec4 v_Color;
void main() {
//    gl_FragColor = v_Color;
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if(dist < 0.5) { // Radius is 0.5
        gl_FragColor = v_Color;
    } else {
        discard;
    }

}