uniform float blueColor;

varying float vAlpha;
varying float vVelocity;
varying float vAngle;

void main() {

    // Convert gl_PointCoord from [0,1] to centered [-1,1]
    vec2 uv = gl_PointCoord * 2.0 - 1.0;

    // rotate uv by -vAngle (so sprite's Y axis aligns with world-up projection)
    float c = cos(-vAngle);
    float s = sin(-vAngle);
    mat2 rot = mat2(c, -s, s, c);
    vec2 r = rot * uv;

    r.x *= 10.0;  // change this for streak length
    r.y *= 0.25;  // thinner width

    float radial = length(r);
    if (radial > 1.0) discard;

    // vertical fade (so ends are softer)
    float vfade = smoothstep(1.2, 0.0, abs(r.x));
    // small radial falloff to soften edges
    float rfade = smoothstep(1.0, 0.3, radial);

    float alpha = vAlpha * vfade * rfade * 0.6; // 0.6 global brightness

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(0.6, 0.7, 1.0, alpha);
}