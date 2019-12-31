attribute vec4 a_Position;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;
varying vec4 v_Color;
void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // Shading calculation to make the arm look three-dimensional
    vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7)); // Light direction
    vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
    vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);
    float nDotL = max(dot(normal, lightDirection), 0.0);
    v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
//    v_Color = vec4(1, 0, 0, 1);
}
