
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
\
    // view-space transform
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Proper size attenuation based on distance to camera
    float dist = -mvPosition.z; // camera-space depth
    float attenuation = clamp(100.0 / dist, 0.0, 1.0);
    gl_PointSize = dropletSize * attenuation;                    
}