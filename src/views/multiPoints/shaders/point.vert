attribute vec4 a_Position;
attribute float a_PointSize;
uniform vec4 u_Translation;
uniform float u_CosB, u_SinB;
uniform mat4 u_modelMatrix;
void main() {
//    gl_Position = a_Position + u_Translation;
/*    gl_Position.x = a_Position.x * u_CosB - a_Position.y *u_SinB;
    gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;*/
    gl_Position = u_modelMatrix * a_Position;
    gl_PointSize = a_PointSize;
}