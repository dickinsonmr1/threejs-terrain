
// per primitive
uniform float uTime;
uniform float uVelocity;
uniform vec3 uCameraPosition;
uniform float uRainSpawnY;
uniform float dropletSize;

// per verfex
attribute float velocity;

// per fragment
varying float vIsReset;
varying float vAlpha;
varying float vVelocity;
varying float vAngle;     // rotation to apply in fragment
varying float vPointSize; // pass point size to fragment if desired

void main() {             
                           
    vec3 newPosition = position;
                    
    newPosition.y -= uVelocity * velocity * uTime; // Update position based on velocity and time
    newPosition.y = mod(newPosition.y, uRainSpawnY); // scale into range of 0->uRainSpawnY
    /*
        // Detect recent reset (optional, for visuals)
        vIsReset = step(frac, 0.05);
        
        // usage of mix: false, true, boolean
        newPosition.x = mix(position.x, position.x + uCameraPosition.x, vIsReset);
        newPosition.z = mix(position.z, position.z + uCameraPosition.z, vIsReset);
    */

    // view-space transform
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Proper size attenuation based on distance to camera
    float dist = -mvPosition.z; // camera-space depth
    float attenuation = clamp(100.0 / dist, 0.0, 1.0);
    gl_PointSize = dropletSize * attenuation;                    
    
    vVelocity = velocity;

    //float t = (uTime * uVelocity + position.y) / uRainSpawnY;
    //float frac = fract(t);
    vAlpha = 0.3;// - frac;
                        
    // ---- compute screen-space direction of world up (0,1,0) at this particle ----
    // clip space for worldPos
    vec4 clip = projectionMatrix * mvPosition; // same as gl_Position
    // compute clip for a small step up in world space
    vec4 clipUp = projectionMatrix * (modelViewMatrix * vec4(newPosition + vec3(0.0, 1.0, 0.0), 1.0));

    // convert to NDC (divide by w)
    vec2 ndc = clip.xy / clip.w;
    vec2 ndcUp = clipUp.xy / clipUp.w;

    // direction in NDC space (screen-space direction)
    vec2 dir = ndcUp - ndc;

    // avoid zero-length; normalize direction to get angle
    float len = length(dir);
    if (len < 1e-6) {
        // fallback -> straight up in screen space
        vAngle = 0.0;
    } else {
        float angleDir = atan(dir.y, dir.x);
        // rotate so that the point-sprite's local +Y (0,1) aligns with dir
        // angle for (0,1) is +pi/2, so subtract that
        vAngle = angleDir - 1.57079632679;
    }
}