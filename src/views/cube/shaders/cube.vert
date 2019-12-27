#pragma glslify: inverse = require(glsl-inverse)
#pragma glslify: transpose = require(glsl-transpose)
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_NormalMatrix;
uniform mat4 u_ModelViewMatrix;
uniform vec3 u_AmbientLightColor; // Color of an ambient light
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
varying vec4 v_Color;
void main() {
    gl_Position = u_ModelViewMatrix * a_Position;
    // Make the length of the normal 1.0
//    vec3 normal = normalize(a_Normal.xyz);
//    vec3 normal = normalize(vec3(transpose(inverse(u_ModelViewMatrix)) * a_Normal));
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    // Dot product of light direction and orientation of a surface
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    // Calculate the color due to diffuse reflection
    vec3 diffuse = u_LightColor * a_Color.rbg * nDotL;
    // Calculate the color due to ambient reflection
    vec3 ambient = u_AmbientLightColor * a_Color.rgb;
    // Add surface colors due to diffuse and ambient reflection
    v_Color = vec4(diffuse + ambient, a_Color.a);
}
