uniform float blueColor;

varying float vAlpha;
varying float vVelocity;
varying float vAngle;

void main() {

    float r = length(gl_PointCoord - vec2(0.5));
    if (r > 0.5) discard;
    gl_FragColor = vec4(0.6, 0.7, 1.0, 0.6);

    return;    
}