attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_NormalMatrix;
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;     // Model matrix
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;
void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_Color = a_Color;
}
