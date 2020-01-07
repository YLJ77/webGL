#pragma glslify: inverse = require(glsl-inverse)
#pragma glslify: transpose = require(glsl-transpose)
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_NormalMatrix;
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;     // Model matrix
uniform vec3 u_AmbientLightColor; // Color of an ambient light
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform vec3 u_LightPosition;   // Position of the light source (in the world coordinate system)
varying vec4 v_Color;
void main() {
    gl_Position = u_MvpMatrix * a_Position;
//    vec3 normal = normalize(vec3(transpose(inverse(u_ModelMatrix)) * a_Normal));
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));

    //============= direction_light_begin
    // Dot product of light direction and orientation of a surface
//     float nDotL = max(dot(u_LightDirection, normal), 0.0);
    //============= direction_light_end

    //============= point_light_begin
    // Calculate the world coordinate of the vertex
    vec4 vertexPosition = u_ModelMatrix * a_Position;
    // Calculate the light direction and make it 1.0 in length
    vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
    float nDotL = max(dot(lightDirection, normal), 0.0);
    //============= point_light_end

    // Calculate the color due to diffuse reflection
    vec3 diffuse = u_LightColor * a_Color.rbg * nDotL;
    // Calculate the color due to ambient reflection
    vec3 ambient = u_AmbientLightColor * a_Color.rgb;
    // Add surface colors due to diffuse and ambient reflection
    v_Color = vec4(diffuse + ambient, a_Color.a);
}
