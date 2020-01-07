precision mediump float;
uniform vec3 u_LightColor; // Light color
uniform vec3 u_LightPosition; // Position of the light source
uniform vec3 u_AmbientLight; // Ambient light color
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_Color;
void main() {
    // Normalize normal because it's interpolated and not 1.0 (length)
    vec3 normal = normalize(v_Normal);
    // Calculate the light direction and make it 1.0 in length
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    // The dot product of the light direction and the normal
    float nDotL = max(dot( lightDirection, normal), 0.0);
    // Calculate the final color from diffuse and ambient reflection
    vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
    vec3 ambient = u_AmbientLight * v_Color.rgb;
    gl_FragColor = vec4(diffuse + ambient, v_Color.a);
}